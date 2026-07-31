# Weather Effects

Seven zero-dependency weather animations on HTML5 canvas. Pure JavaScript, no
libraries, no external assets — every effect works offline, straight from
`file://`, no build step.

**Live demo:** https://amitj.me/weather-effects/

| Effect | Demo | Options |
|--------|------|---------|
| 🌧️ Rain | [rain.html](https://amitj.me/weather-effects/rain.html) | `angle` −45..45, `intensity`, `thunder` |
| ❄️ Snow | [snow.html](https://amitj.me/weather-effects/snow.html) | `wind` −10..10, `intensity`, `settle` |
| 🌤️ Sky | [sky.html](https://amitj.me/weather-effects/sky.html) | `wind`, `phase` dawn/day/dusk/night, `mode` clear/partly/cloudy, `intensity`, `birds` |
| 🌫️ Fog | [fog.html](https://amitj.me/weather-effects/fog.html) | `wind` −10..10, `intensity`, `sun` |
| 🧊 Hail | [hail.html](https://amitj.me/weather-effects/hail.html) | `wind` −10..10, `intensity`, `thunder` |
| 💨 Wind | [wind.html](https://amitj.me/weather-effects/wind.html) | `wind` −10..10, `intensity`, `leaves` |
| 🌨️ Sleet | [sleet.html](https://amitj.me/weather-effects/sleet.html) | `wind` −10..10, `intensity`, `slush` |

`intensity` is always `'low' | 'mid' | 'high'`.

## Usage

Each effect is a single self-contained JS file exposing one global class.
Drop it next to your page and point it at a canvas:

```html
<canvas id="weather"></canvas>
<script src="rain.js"></script>
<script>
  const rain = new RainEffect(document.getElementById('weather'), {
    angle: 15,
    intensity: 'high',
    thunder: true,
  });

  rain.setAngle(-20);        // every option has a setter
  rain.setIntensity('low');
  rain.destroy();            // stops the loop, removes listeners
</script>
```

The same pattern holds for `SnowEffect`, `SkyEffect`, `FogEffect`,
`HailEffect`, `WindEffect` and `SleetEffect` — construct with a canvas and an
options object, tweak at runtime through `set<Option>()`, tear down with
`destroy()`.

## Highlights

- **Zero dependencies, zero assets** — one JS file per effect, canvas 2D only.
- **Frame-rate independent** — delta-time stepping, consistent at 30/60/144 Hz.
- **Sharp on any screen** — devicePixelRatio-aware rendering, auto-resize.
- Rain and hail come with procedural lightning; snow settles into drifts;
  sleet builds a slush layer; wind gusts arrive in bursts with curling
  streamlines; the sky runs volumetric clouds through a full day cycle.

## License

[MIT](LICENSE) © Amit Joshi
