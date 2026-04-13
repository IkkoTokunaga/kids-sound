# 音源再収集メモ（手作業URL版）

## 未取得ファイル（31件）

- `alarm-clock.mp3`
- `ambulance.mp3`
- `bell.mp3`
- `bus.mp3`
- `castanets.mp3`
- `drum-set.mp3`
- `fire-truck.mp3`
- `flute.mp3`
- `frying-pan.mp3`
- `guitar.mp3`
- `harmonica.mp3`
- `helicopter.mp3`
- `kettle.mp3`
- `motorbike.mp3`
- `pig.mp3`
- `police-car.mp3`
- `printer.mp3`
- `recorder.mp3`
- `shinkansen.mp3`
- `ship.mp3`
- `taiko.mp3`
- `tambourine.mp3`
- `taxi.mp3`
- `telephone.mp3`
- `toothbrushing.mp3`
- `train.mp3`
- `trumpet.mp3`
- `vacuum-cleaner.mp3`
- `violin.mp3`
- `washing-machine.mp3`
- `xylophone.mp3`

## 1件ずつ保存するコマンド（Docker内）

`SOURCE_URL` を取得元URL、`OUT_NAME` を保存名に置き換えて実行します。

```bash
docker exec kids-sound-app bash -lc '
set -e
SRC_URL="SOURCE_URL"
OUT_NAME="OUT_NAME"
TMP_IN="/tmp/src_audio"
TMP_OUT="/app/public/sounds/${OUT_NAME}"
curl -L "$SRC_URL" -o "$TMP_IN"
ffmpeg -y -i "$TMP_IN" -t 5 -ac 1 -ar 44100 -vn "$TMP_OUT"
rm -f "$TMP_IN"
echo "saved: $TMP_OUT"
'
```

例:

```bash
docker exec kids-sound-app bash -lc '
set -e
SRC_URL="https://example.com/sound.wav"
OUT_NAME="train.mp3"
TMP_IN="/tmp/src_audio"
TMP_OUT="/app/public/sounds/${OUT_NAME}"
curl -L "$SRC_URL" -o "$TMP_IN"
ffmpeg -y -i "$TMP_IN" -t 5 -ac 1 -ar 44100 -vn "$TMP_OUT"
rm -f "$TMP_IN"
echo "saved: $TMP_OUT"
'
```

## 保存後の確認

```bash
python3 - <<'PY'
import re, pathlib
root = pathlib.Path("/home/i_tokunaga/htdoc/kids-sound")
q = (root / "src/data/questions.ts").read_text(encoding="utf-8")
all_files = set(re.findall(r'fileName:\\s*"([^"]+)"', q))
have = {p.name for p in (root / "public/sounds").glob("*.mp3")}
missing = sorted(all_files - have)
print("missing:", len(missing))
for f in missing:
    print("-", f)
PY
```
