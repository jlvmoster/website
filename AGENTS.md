## Git workflow

This repo uses `rules/gitflow/skullcandy.md` from `jlvmoster/mosterrules`. Feature branches are cut from `qa` and pull requests target `qa`. Releases are a `qa` -> `master` pull request.

Push your branch, then run `scripts/open-pr.sh <branch> qa "<title>" "<body>"`. Don't use Cursor's create-PR action.

`MOSTER_DEV_APP_ID` and `MOSTER_DEV_PRIVATE_KEY_B64` must be set.
