<template>
  <Layout>
    <div class="about">
      <div class="intro">
        <h1>I'm Kevin Rangel.</h1>
        <small>(AKA venikx)</small>
        <g-image
          src="~/assets/me.jpg"
          width="300"
          alt="A picture of myself sitting in a typical brown Croation restaurant."
        />
        <p>
          I'm a developer who focuses mainly on web development.
        </p>
      </div>

      <section>
        <h2>
          <g-image
            src="~/assets/computer.gif"
            width="48"
            alt="A cartoon drawing of someone on a computer"
          />
          Special Skills
          <g-image
            src="~/assets/computer.gif"
            width="48"
            alt="A cartoon drawing of someone on a computer"
          />
        </h2>
        <p>
          Web development (HTML, CSS and Javascript), playing lots of games (but
          failing at all of them), the art of procrastination, consistently
          crack my right index finger, proficient in web browsing, overthinking.
        </p>
      </section>

      <section class="right">
        <h2>
          <g-image
            class="flip"
            src="~/assets/candle.gif"
            width="48"
            alt="A cartoon drawing of someone on a computer"
          />
          Hobbies and Interests
          <g-image
            src="~/assets/candle.gif"
            width="48"
            alt="A cartoon drawing of someone on a computer"
          />
        </h2>

        <p>
          Programming, video games, eSports, dungeons and dragons, napping,
          netflix, watching dank meme collections.
        </p>
      </section>

      <section>
        <h2>
          <g-image
            src="~/assets/crashbandicoot.gif"
            width="48"
            alt="A cartoon drawing of someone on a computer"
          />
          Favourite Games
          <g-image
            class="flip"
            src="~/assets/crashbandicoot.gif"
            width="48"
            alt="A cartoon drawing of someone on a computer"
          />
        </h2>
        <p>
          Crash Bash (PS1), Grand Theft Auto: Vice City (PS2), Spyro (PS1),
          Kingdom Hearts (PS2), Pokémon (GameBoy), Paper Boy (SNES), Lemmings,
          ExciteBike, SXX Tricky (PS2), Motorhead (PS1), Rocket League (PC),
          Ronaldo V-Football (PS1), The Last of US (PS4), Tomb Raider (PC),
          Battlefield 3 (PC), The Sims 2 (PC), Worms 2 (PC), Portal (PC), Super
          Mario Bros 2 (GameBoy), Roller Coaster Tycoon 2 (PC), Braid (PC),
          Kirby (GameBoy), Guild Wars 2 (PC)
        </p>
      </section>

      <section class="right">
        <h2>
          <g-image
            class="flip"
            src="~/assets/guitarman.gif"
            width="40"
            alt="A cartoon drawing of someone on a computer"
          />
          Favourite Music
          <g-image
            src="~/assets/guitarman.gif"
            width="40"
            alt="A cartoon drawing of someone on a computer"
          />
        </h2>
        <p>
          Caspian, LazorHawk, Nada Surf, Sum 41, Discolure, Attack, George Ezra,
          Savant, Muse, Linkin Park, The National, Linkin Park, Owl City, Pearl
          Jam, Bring Me The Horizon, Skrillex, Rise Against, Saosin, Royal
          Blood, Explosions In The Sky, Mogwai, Paramore, Netsky, "Weird Al"
          Yankovic, Daft Punk, Bullet For My Valentine, Chase & Status, Green
          Day, Uberdope, Ellie Goulding, De Jeugd Van Tegenwoordig, Tobu, Ylvis,
          Jack Johnson, The Kooks, Hans Zimmer, Shameboy, Gorillaz, Eric
          Clapton, Jimi Hendrix, John Mayer, Gavlyn, Carpenter Brut, Jinjer, M83
        </p>
      </section>

      <section>
        <h2>
          <g-image
            class="flip"
            src="~/assets/bartxxx.gif"
            width="40"
            alt="A cartoon drawing of someone on a computer"
          />
          Favourite Memes
          <g-image
            src="~/assets/bartxxx.gif"
            width="40"
            alt="A cartoon drawing of someone on a computer"
          />
        </h2>
        <p>
          Doge, Rage Comics, Woman Yelling at a Cat, Bad Luck Brian, Wat, Kappa,
          Grumpy Cat, First World Problems, One Does Not Simply Walk into
          Mordor, Darude - Sandstorm, Success Kid, Chubby Bubbles, Girl, Roll
          Safe, I Have No Idea What I'm Doing, Shut Up And Take My Money!, It's
          A Trap!, Are you a wizard?, Surprise Motherfucker, Side Eyeing Chloe,
          This is fine, Confused Black Girl, Surprised Pikachu, TechnoViking,
          Computer Reaction Faces, Bed intruder, Karen, Deez Nuts, Trololo Guy,
          Ia this a Pigeon?, Overly Manly Man, Brent Rambo, You know nothing
          John Snow, Salt Bae, Crying Cat, Suddenly Clarity Clarence, Ah Shit
          here we go again,
        </p>
      </section>
    </div>
  </Layout>
</template>

<script>
export default {
  metaInfo: {
    title: 'About us',
  },
}
</script>

<style>
.about {
  grid-column: 2;
  grid-row: 2;
}

.about section {
  margin-top: 4rem;
  margin-bottom: 4rem;
}

.intro {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.intro h1 {
  text-align: right;
  margin-bottom: 0;
  line-height: 1;
  grid-column: 1 / -1;
}

.intro small {
  font-size: 1.2rem;
  font-weight: normal;
  text-align: right;
  padding-right: 0.4rem;
  padding-bottom: 2rem;
  grid-column: 1 / -1;
}

.intro img {
  grid-column: 1 / -1;
  justify-self: center;
}

.intro p {
  grid-column: 1 / -1;
}

.about h2 {
  display: flex;
  align-items: center;
  text-align: center;
}

.about h2 img {
  align-self: center;
}

.about h2 img:first-of-type {
  margin-right: 1rem;
}

.about h2 img:last-of-type {
  margin-left: 1rem;
}

.flip {
  transform: scaleX(-1);
}

.right {
  text-align: right;
}

.right h2 {
  justify-content: right;
}

@media (min-width: 600px) {
  .intro img {
    align-self: flex-end;
    grid-column: 2 / 3;
    grid-row: 3;
  }

  .intro p {
    grid-column: 1 / 2;
    grid-row: 3;
  }
}
</style>
