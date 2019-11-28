<template>
  <div class="layout">
    <nav>
      <ul>
        <!-- <li><g-link to="/">{{ $static.metadata.siteName }}</g-link></li> -->
        <li><g-link to="/cv">CV</g-link></li>
        <li><g-link to="/labs">Lab</g-link></li>
        <li>
          <g-link to="/home">
            <g-image src="~/assets/phoenix.gif" alt="A flying phoenix" />
          </g-link>
        </li>
        <li><g-link to="/blog">Blog</g-link></li>
        <li><g-link to="/about">About</g-link></li>
      </ul>
    </nav>
    <slot/>
  </div>
</template>

<static-query>
query {
  metadata {
    siteName
  }
}
</static-query>

<style>
html {
  font-size: 62.5%;
}

body {
  font-family: 'Roboto';
  background: url("~@/assets/stars.gif") #00001a;
  }

body::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: darkblue;
  opacity: 0.1;
  z-index: -1;
}

nav {
  color: white;
}

nav::after {
  content: '';
  background: url("~@/assets/divider-rainbow.gif") #8c1eff;
  height: 1px;
  width: 100%;
  display: inline-block;
}

a {
  cursor: auto;
  cursor: url("~@/assets/hand.gif"), auto;
  color: white;
  font-size: 2rem;
}
</style>
