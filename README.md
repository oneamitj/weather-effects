# Weather Effects

Seven weather animations drawn on HTML5 canvas, plus a set of time and weather
cards built from them.

No libraries, no images, no build step. Each effect is one JavaScript file that
draws everything procedurally — clouds, lightning, snow drifts, hailstones — so
the whole thing runs offline, straight from `file://`.

**[See them running →](https://amitj.me/weather-effects/)**

## The effects

| | Effect | What it does |
|---|---|---|
| 🌧️ | **[Rain](https://amitj.me/weather-effects/rain.html)** | Teardrop streaks slanted to any angle, splashing where they land, with procedural lightning that forks across the sky and flashes the whole scene. |
| ❄️ | **[Snow](https://amitj.me/weather-effects/snow.html)** | Four parallax layers, from tiny blurred flakes far away to out-of-focus blobs drifting past the camera. Snow piles into drifts along the ground. |
| 🌤️ | **[Sky](https://amitj.me/weather-effects/sky.html)** | A full day sky: dawn through night, volumetric cumulus and thin cirrus, a sun that dims as clouds cross it, and bird flocks that pass through and roost at night. |
| 🌫️ | **[Fog](https://amitj.me/weather-effects/fog.html)** | Layered banks drifting at different speeds, thick enough to swallow the background, thin enough to let a hazy sun burn through. |
| 🧊 | **[Hail](https://amitj.me/weather-effects/hail.html)** | Ice stones that bounce and scatter off the ground, shed chips on impact, then lie there and melt. Green storm sky, thunder included. |
| 💨 | **[Wind](https://amitj.me/weather-effects/wind.html)** | Gusts arrive in bursts: lines sweep in along curving streamlines, some rolling through a curl, then dissolve. Between gusts the air goes still and leaves tumble. |
| 🌨️ | **[Sleet](https://amitj.me/weather-effects/sleet.html)** | Rain, half-melted flakes and ice pellets falling at once, the pellets ticking off the ground, everything building a slush line. |

## Weather cards

**[amitj.me/weather-effects/cards →](https://amitj.me/weather-effects/cards/)**

The effects put to work as UI: clock cards with the local sky living behind
them, across all ten conditions and at both card and list size. Every card shows
the real current time for its city, and the time of day is scrubbable — flip it
and the whole grid crossfades from dawn to night together.

The cards run a separate build under [`cards/`](cards/) that adds a `sizeMul`
option. It scales particles, clouds and drifts down so the detail still reads
inside a 358×150 card, or a 58-pixel list row, instead of turning to mush.

## Usage

Each effect is one self-contained file exposing one global class. Drop it beside
your page and point it at a canvas:

```html
<canvas id="weather"></canvas>
<script src="rain.js"></script>
<script>
  const rain = new RainEffect(document.getElementById('weather'), {
    angle: 15,
    intensity: 'high',
    thunder: true,
  });

  rain.setAngle(-20);      // every option has a matching setter
  rain.setIntensity('low');
  rain.destroy();          // stops the loop, drops the resize listener
</script>
```

Every effect follows that shape: construct with a canvas and an options object,
change anything at runtime through `set<Option>()`, tear down with `destroy()`.
`intensity` is always `'low' | 'mid' | 'high'` and `wind` always runs `-10` to
`10`, positive blowing right.

| Class | Options (with defaults) |
|-------|-------------------------|
| `RainEffect` | `angle: 0` (−45..45), `intensity: 'mid'`, `thunder: true` |
| `SnowEffect` | `wind: 0`, `intensity: 'mid'`, `settle: true` |
| `SkyEffect` | `wind: 0`, `phase: 'day'` (`dawn`/`day`/`dusk`/`night`), `mode: 'partly'` (`clear`/`partly`/`cloudy`), `intensity: 'mid'`, `birds: true` |
| `FogEffect` | `wind: 3`, `intensity: 'mid'`, `sun: true` |
| `HailEffect` | `wind: 2`, `intensity: 'mid'`, `thunder: true` |
| `WindEffect` | `wind: 6`, `intensity: 'mid'`, `leaves: true` |
| `SleetEffect` | `wind: 3`, `intensity: 'mid'`, `slush: true` |

Toggles are honest about state: turn `settle` or `slush` off and the pile melts
away rather than blinking out.

## How it holds up

- **Nothing to install.** One file per effect, canvas 2D only. No fetch, no CDN,
  no bundler — open the HTML and it runs.
- **Same speed everywhere.** Every effect steps on delta time, so a 144 Hz
  monitor and a throttled 30 Hz tab see the same storm, not one at double speed.
- **Sharp on retina.** Canvases are sized to `devicePixelRatio` and re-laid out
  on resize.
- **Cheap where it counts.** Cloud puffs, bokeh flakes and fog blobs are
  pre-rendered once to offscreen canvases and stamped per frame, so the
  expensive gradient work happens at startup instead of 60 times a second.

## Running locally

```sh
git clone https://github.com/oneamitj/weather-effects.git
cd weather-effects
open index.html        # or just double-click it
```

No server needed. A server is only worth starting if you want the exact same
paths as the live demo.

## License

[MIT](LICENSE) © Amit Joshi
