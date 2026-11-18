#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Garantiza la integridad de las instantáneas oficiales versionadas.

- Modo escritura (por defecto): añade/actualiza `sha256_instantanea_repo`
  en cada data/official/*.metadata.json con el SHA-256 real del fichero commiteado.
- Modo --check (CI): falla con exit 1 si falta el campo o no coincide.

Cubre también `centros_educativos_datos_abiertos_tea.json`, asegurando la
verificación criptográfica completa de todas las instantáneas en `data/official/`.
"""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

OFFICIAL_DIR = Path(__file__).resolve().parent.parent / "data" / "official"
META_SUFFIX = ".metadata.json"
HASH_FIELD = "sha256_instantanea_repo"


def sha256_of(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def resolve_snapshot(meta_path: Path) -> Path:
    stem = meta_path.name[: -len(META_SUFFIX)]
    candidates = sorted(
        p
        for p in OFFICIAL_DIR.iterdir()
        if p.is_file()
        and p.name.startswith(stem)
        and not p.name.endswith(META_SUFFIX)
    )
    if len(candidates) != 1:
        raise SystemExit(
            f"❌ {meta_path.name}: se esperaba 1 fichero base, hay {len(candidates)}: "
            f"{[c.name for c in candidates]}"
        )
    return candidates[0]


def main() -> int:
    check_only = "--check" in sys.argv[1:]
    if not OFFICIAL_DIR.is_dir():
        print(f"❌ No existe {OFFICIAL_DIR}")
        return 1

    failures: list[str] = []
    updated: list[str] = []
    for meta_path in sorted(OFFICIAL_DIR.glob(f"*{META_SUFFIX}")):
        snapshot = resolve_snapshot(meta_path)
        real_hash = sha256_of(snapshot)
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        declared = meta.get(HASH_FIELD)

        if check_only:
            if declared != real_hash:
                failures.append(
                    f"{snapshot.name}: declarado={declared!r} real={real_hash}"
                )
            else:
                print(f"  ✓ {snapshot.name}: {HASH_FIELD} coincide")
            continue

        if declared != real_hash:
            meta[HASH_FIELD] = real_hash
            meta_path.write_text(
                json.dumps(meta, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            updated.append(snapshot.name)
            print(f"  ✚ {snapshot.name}: {HASH_FIELD} actualizado")
        else:
            print(f"  ✓ {snapshot.name}: ya correcto")

    if check_only:
        if failures:
            print("❌ Integridad de instantáneas fallida:")
            for failure in failures:
                print(f"   - {failure}")
            return 1
        print("✅ Todas las instantáneas verificadas.")
        return 0

    print(f"✅ Hashes al día ({len(updated)} actualizados).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
