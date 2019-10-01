<template>
  <div id="app">
    <Header />
    <!-- <Content class="d-flex"/> -->
    <!-- px-5 py-3 p-md-5 w-100 mx-auto text-center align-self-center -->
    <Content class="d-flex"/>
    <Footer class="d-flex pt-3 pb-3"/>
  </div>
</template>

<script>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import Content from './components/Main.vue'

export default {
  name: 'app',
  components: {
    Header,
    Content,
    Footer
  }
}
</script>

<style lang="scss">

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

</style>
