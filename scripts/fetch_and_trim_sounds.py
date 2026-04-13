#!/usr/bin/env python3
import json
import os
import pathlib
import re
import subprocess
import tempfile
from typing import Dict, List, Optional
import urllib.parse
import urllib.request

API_URL = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "kids-sound-audio-fetcher/1.0"
ROOT = pathlib.Path(__file__).resolve().parents[1]
QUESTIONS_FILE = ROOT / "src" / "data" / "questions.ts"
OUT_DIR = ROOT / "public" / "sounds"
QUERY_OVERRIDES = {
  "pig.mp3": ["pig oink", "pig grunt"],
  "ambulance.mp3": ["ambulance siren"],
  "police-car.mp3": ["police siren", "police car siren"],
  "fire-truck.mp3": ["fire engine siren", "fire truck siren"],
  "ship.mp3": ["ship horn", "boat horn"],
  "train.mp3": ["train passing", "railway train horn"],
  "shinkansen.mp3": ["bullet train", "high speed train japan"],
  "bus.mp3": ["city bus", "bus passing"],
  "taxi.mp3": ["car horn", "taxi car"],
  "motorbike.mp3": ["motorcycle engine", "motorbike passing"],
  "helicopter.mp3": ["helicopter flyover", "helicopter rotor"],
  "toothbrushing.mp3": ["tooth brushing", "brushing teeth"],
  "telephone.mp3": ["telephone ring", "phone ringing"],
  "alarm-clock.mp3": ["alarm clock ringing", "clock alarm"],
  "washing-machine.mp3": ["washing machine", "laundry machine"],
  "vacuum-cleaner.mp3": ["vacuum cleaner", "hoover vacuum"],
  "frying-pan.mp3": ["frying pan", "pan cooking"],
  "kettle.mp3": ["kettle boiling", "tea kettle whistle"],
  "printer.mp3": ["printer printing", "office printer"],
  "drum-set.mp3": ["drum set", "acoustic drums"],
  "trumpet.mp3": ["trumpet instrument", "trumpet note"],
  "bell.mp3": ["hand bell", "small bell ringing"],
  "taiko.mp3": ["taiko drum", "japanese drum"],
  "guitar.mp3": ["acoustic guitar", "guitar chord"],
  "violin.mp3": ["violin instrument", "violin note"],
  "flute.mp3": ["flute instrument", "flute note"],
  "recorder.mp3": ["recorder instrument", "soprano recorder"],
  "tambourine.mp3": ["tambourine shake", "tambourine instrument"],
  "castanets.mp3": ["castanets instrument", "castanet clicks"],
  "xylophone.mp3": ["xylophone instrument", "xylophone notes"],
  "harmonica.mp3": ["harmonica instrument", "mouth organ"],
}


def read_filenames() -> List[str]:
  content = QUESTIONS_FILE.read_text(encoding="utf-8")
  return re.findall(r'fileName:\s*"([^"]+)"', content)


def request_json(params: Dict[str, str]) -> Dict:
  url = f"{API_URL}?{urllib.parse.urlencode(params)}"
  req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
  with urllib.request.urlopen(req, timeout=20) as response:
    return json.loads(response.read().decode("utf-8"))


def search_audio_file_titles(query: str) -> List[str]:
  data = request_json(
    {
      "action": "query",
      "list": "search",
      "srnamespace": "6",
      "srlimit": "8",
      "srsearch": f"{query} filetype:ogg OR filetype:wav OR filetype:flac sound",
      "format": "json",
    }
  )
  return [item["title"] for item in data.get("query", {}).get("search", [])]


def get_file_url(title: str) -> Optional[str]:
  data = request_json(
    {
      "action": "query",
      "titles": title,
      "prop": "imageinfo",
      "iiprop": "url|mime",
      "format": "json",
    }
  )
  pages = data.get("query", {}).get("pages", {})
  for page in pages.values():
    infos = page.get("imageinfo", [])
    if not infos:
      continue
    info = infos[0]
    if str(info.get("mime", "")).startswith("audio/"):
      return info.get("url")
  return None


def download(url: str, path: pathlib.Path) -> None:
  req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
  with urllib.request.urlopen(req, timeout=60) as response:
    path.write_bytes(response.read())


def trim_to_mp3(src_path: pathlib.Path, dst_path: pathlib.Path) -> bool:
  cmd = [
    "ffmpeg",
    "-y",
    "-i",
    str(src_path),
    "-t",
    "5",
    "-ac",
    "1",
    "-ar",
    "44100",
    "-vn",
    str(dst_path),
  ]
  result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
  return result.returncode == 0 and dst_path.exists() and dst_path.stat().st_size > 0


def query_from_filename(file_name: str) -> str:
  stem = pathlib.Path(file_name).stem
  return stem.replace("-", " ")


def build_queries(file_name: str) -> List[str]:
  fallback = query_from_filename(file_name)
  queries = QUERY_OVERRIDES.get(file_name, [])
  return queries + [fallback]


def main() -> None:
  OUT_DIR.mkdir(parents=True, exist_ok=True)
  file_names = read_filenames()
  failed: List[str] = []
  done = 0

  for file_name in file_names:
    out_path = OUT_DIR / file_name
    if out_path.exists() and out_path.stat().st_size > 0:
      done += 1
      continue

    success = False

    with tempfile.TemporaryDirectory() as tmp_dir:
      tmp_path = pathlib.Path(tmp_dir)
      for query in build_queries(file_name):
        titles = search_audio_file_titles(query)
        for title in titles:
          file_url = get_file_url(title)
          if not file_url:
            continue
          source_path = tmp_path / "source_audio"
          try:
            download(file_url, source_path)
          except Exception:
            continue
          if trim_to_mp3(source_path, out_path):
            success = True
            break
        if success:
          break

    if success:
      done += 1
      print(f"OK  {file_name}")
    else:
      failed.append(file_name)
      print(f"NG  {file_name}")

  print("")
  print(f"Completed: {done}/{len(file_names)}")
  if failed:
    print("Missing:")
    for name in failed:
      print(f"- {name}")


if __name__ == "__main__":
  main()
