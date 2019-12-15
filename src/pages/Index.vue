<template>
  <Layout>
    <section>
      <g-image
        src="~/assets/construction.gif"
        alt="A GeoCities 'Under Construction' gif"
      />
    </section>
  </Layout>
</template>

<script>
export default {
  metaInfo: {
    title: 'Hello, world!',
  },
}
</script>

<style>
section {
  grid-column: 2;
  grid-row: 2;
}
</style>
