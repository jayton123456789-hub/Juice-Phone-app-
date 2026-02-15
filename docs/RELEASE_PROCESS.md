# WRLD Release Process (Simple)

## 1) Bump version
Edit `package.json` version (example `0.0.2`).

## 2) Commit
```bash
git add package.json README.md .github/workflows/windows-release.yml docs/RELEASE_PROCESS.md
git commit -m "Prepare v0.0.2 release"
```

## 3) Create and push tag
```bash
git tag v0.0.2
git push origin main --tags
```

## 4) GitHub does the rest
When tag `v*` is pushed, workflow `Build Windows Release`:
- builds Windows portable EXE
- creates `WRLD-v0.0.2-portable.zip`
- attaches both files to the GitHub Release

## 5) Release page fields
- **Release title:** `WRLD v0.0.2`
- **Set as pre-release:** only if testing
- **Release description:** short changes + install line:
  - Download ZIP or EXE
  - Extract if ZIP
  - Run `WRLD.exe`
