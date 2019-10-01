<template>
  <b-container id="content">

    <b-alert :show="dismissCountDown" dismissible variant="danger" @dismissed="dismissCountDown=0" @dismiss-count-down="countDownChanged" id="alert">
      <p>{{alertText}}</p>
      <b-progress variant="danger" :max="dismissSecs" :value="dismissCountDown" height="4px"></b-progress>
    </b-alert>

    <!-- Not Logged in -->
    <div class="align-self-center text-center w-100" v-if="!auth">
      <h3>Download Your Nightbot Playlist</h3>
      <p class="lead">Output your Nightbot playlist into a text file so you can make a new one.</p>
      <b-button variant="primary" size="lg" href="#" v-on:click="login">Login</b-button>
    </div>

    <!-- Logged in -->
    <div class="align-self-center w-100 mx-auto" v-if="auth">
      <h5>Format your output file</h5>
      <b-row no-gutters class="my-1">
        <b-input-group>
          <b-form-input id="template-insert" v-model="text"></b-form-input>
          <b-input-group-append>
            <b-button variant="outline-dark" v-on:click="clear">
              Clear
            </b-button>
            <b-button variant="outline-dark" v-on:click="download">
              Download
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-row>
      <b-button size="sm" v-on:click="insert(prop)" class="mr-1 my-2" v-for="prop in getObjectProps" v-bind:key="prop">
        {{prop}}
      </b-button>

      <p class="mb-1">Example Output File</p>

      <b-form-textarea
      id="exampletextarea"
      v-model="exampleoutput"
      rows="6"
      max-rows="6"
      disabled
      no-resize
      placeholder="Loading songs..."
      class=""
      >
      </b-form-textarea>
      <br>
      <p>Account: {{user.displayName}}, Platform: {{user.provider}}</p>
    </div>
  </b-container>
</template>

<script>
import axios from 'axios'
import { csrfToken, parseHash, removeHash } from '../util/auth'
import Mustache from 'mustache'
import { debounce } from 'lodash'
import { saveAs } from 'file-saver'

export default {
  name: 'mainContent',
  data () {
    return {
      clientid: 'a71ce8861f5aedd53175c81b1ae94f69',
      request: null,
      user: {},
      songs: [],
      auth: false,
      text: '{{{title}}} - {{{url}}}',
      output: '',
      exampleoutput: '',
      dismissSecs: 30,
      dismissCountDown: 0,
      alertText: ''
    }
  },
  computed: {
    getObjectProps () {
      if (!this.songs.length) return
      return Object.keys(this.songs[0].track).map(x => `{{{${x}}}}`)
    }
  },
  watch: {
    text () {
      console.log(this.text)
      this.debouncedText()
    },
    songs () {
      this.renderText()
    }
  },
  methods: {
    login (e) {
      e.preventDefault()
      const state = csrfToken()
      const { location, localStorage } = window
      /* Set csrf token */
      localStorage.setItem(state, 'true')
      window.location.href = `https://api.nightbot.tv/oauth2/authorize?client_id=${this.clientid}&response_type=token&redirect_uri=${location.href}&state=${state}&scope=song_requests_playlist`
    },
    async getsongs () {
      if (!this.auth) return
      this.songs = await this.getPlaylist()
    },
    async getPlaylist (payload = [], offset = 0) {
      const offsetInc = 100
      const { data } = await this.request(`/song_requests/playlist?limit=100&offset=${offset}`)
      console.log(data)
      payload = payload.concat(data.playlist)
      if (data._total > offset + offsetInc) {
        return this.getPlaylist(payload, offset + offsetInc)
      }
      return payload
    },
    renderText () {
      console.log('rendering text')
      let output = ''
      const trucSongs = this.songs.slice(0, 5)
      for (const song of trucSongs) {
        try { // Add new line... checkbox
          output += Mustache.render(this.text, song.track) + '\n'
        } catch (e) {
          this.exampleoutput = `Unable to render, check your brackets {}'s and make sure they match`
          return
        }
      }
      if (trucSongs.length === 5) {
        output += `----- plus ${this.songs.length - 5} songs  -----`
      }
      console.log(output)
      this.exampleoutput = output
    },
    download () {
      console.log('this was a download')
      let output = ''
      for (const song of this.songs) {
        try { // Add new line... checkbox
          output += Mustache.render(this.text, song.track) + '\n'
        } catch (_) {
          this.showAlert('Error while trying to render, check your brackets')
          return
        }
      }
      const date = new Date()
      const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
      saveAs(blob, `${date.getMonth()}-${date.getDay()}-${date.getFullYear()}-playlist.txt`)
    },
    insert (text) {
      this.text += `${this.text.slice(-1) === ' ' ? '' : ' '}${text}`
      this.renderText()
    },
    clear () {
      this.text = ''
      this.renderText()
    },
    countDownChanged (dismissCountDown) {
      this.dismissCountDown = dismissCountDown
    },
    showAlert (text) {
      this.alertText = text
      this.dismissCountDown = this.dismissSecs
    }
  },
  mounted () {
    const response = parseHash(window.location.hash)
    removeHash()

    // Check forgery
    if (response.token && !localStorage.getItem(response.csrf)) {
      alert('Token invalid.')
      return
    }

    // Clean up CSRF token
    localStorage.removeItem(response.state)

    // Dev mode if you hardcode the access_token
    if (!this.user.access_token && !response.access_token) return

    if (response.access_token) {
      this.user.access_token = response.access_token
    }

    this.request = axios.create({
      baseURL: 'https://api.nightbot.tv/1/',
      headers: {
        'Authorization': `Bearer ${this.user.access_token}`
      }
    })

    this.request('/me')
      .then(data => {
        this.user = { ...this.user, ...data.data.user }
        this.auth = true
        this.getsongs()
      })
      .catch(error => {
        this.showAlert('Something went wrong fetching your profile...')
        console.log(error)
      })
  },
  created () {
    this.debouncedText = debounce(this.renderText, 1000)
  }
}
</script>

<style lang="scss">
#content {
  flex: 1 1;
}

#alert {
  position: fixed;
  left: 50%;
  transform: translate(-50%, 0);
  top: 10%;
}

.lead {
  font-size: 1.10rem;
  font-weight: 300;
}
</style>
