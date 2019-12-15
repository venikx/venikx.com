<template>
  <div class="layout">
    <Header />
    <slot />
  </div>
</template>

<script>
import Header from '~/components/Header.vue'

export default {
  components: {
    Header,
  },
}
</script>

<style>
html {
  font-size: 62.5%;
}

body {
  font-family: monospace;
  font-weight: 400;
  font-kerning: normal;
  line-height: 1.2;
  background: url('~@/assets/stars.gif') var(--black);
  color: var(--white);
}

body::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: #130025;
  opacity: 0.1;
  z-index: -1;
}

.layout {
  display: grid;
  grid-template-columns: 1fr minmax(20rem, 72rem) 1fr;
  grid-gap: 2rem;
  justify-items: 'center';
  align-items: 'center';
}

a {
  cursor: pointer;
  cursor: url('~@/assets/hand.gif'), pointer;
}

h1 {
  font-size: 4.2rem;
}

h2 {
  font-size: 2.8rem;
}

h3 {
  font-size: 2rem;
}

p {
  font-size: 1.4rem;
}
</style>
