# おとあそび

こどもむけの おとあて クイズです。

## Docker で かんたん きどう

このプロジェクトは `docker compose` で いつでも きどうできます。

```bash
docker compose up --build -d
```

ブラウザで [http://localhost:3000](http://localhost:3000) を ひらいてください。

## ていし・さいきどう

```bash
# ていし
docker compose down

# ログを みる
docker compose logs -f app

# さいきどう
docker compose up -d
```

## おとファイルの ばしょ

`public/sounds/` に つぎのファイルを おいてください。

- `dog.mp3`
- `cat.mp3`
- `elephant.mp3`
- `lion.mp3`
