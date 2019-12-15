<template>
  <header>
    <nav>
      <ul>
        <li>
          <g-link to="/cv"><span>CV</span></g-link>
        </li>
        <li>
          <g-link to="/labs"><span>Lab</span></g-link>
        </li>
        <!-- <li><g-link to="/"><span>{{ $static.metadata.siteName }}</span></g-link></li> -->
        <li>
          <g-image src="~/assets/phoenix.gif" alt="A flying phoenix" />
        </li>
        <li>
          <g-link to="/blog"><span>Blog</span></g-link>
        </li>
        <li>
          <g-link to="/about"><span>About</span></g-link>
        </li>
      </ul>
    </nav>
  </header>
</template>

<static-query>
query {
  metadata {
    siteName
  }
}
</static-query>

<style>
header {
  grid-column: 2;
  grid-row: 1;
}

nav::after {
  content: '';
  background: url('~@/assets/divider-rainbow.gif') var(--violet);
  height: 1px;
  width: 80%;
  display: block;
  margin: 0 auto;
}

nav ul {
  margin: 0;
  padding: 0;
  list-style-type: none;

  display: flex;
  justify-content: center;
  align-items: center;
}

nav ul li {
  margin-right: 1rem;
  margin-left: 1rem;
}

a {
  font-size: 1.3rem;
  text-decoration: none;
  background-color: var(--white);
  color: var(--black);
  display: inline-block;
  transition: box-shadow 0.1s;
  transform: skew(-20deg);
  padding: 1rem;
}

span {
  display: inline-block;
  transform: skew(20deg);
}

a:visited {
  background-color: var(--white);
  color: var(--black);
}

a:hover {
  box-shadow: 0px 0px 8px var(--white);
}
</style>
