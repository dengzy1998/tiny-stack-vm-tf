[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/dengzy1998/tiny-stack-vm-tf/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/dengzy1998/tiny-stack-vm-tf/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

# Tiny Stack VM — second implementation

An entry for make.fun's tiny stack VM bounty (run of 22 November 2026): a complete implementation of the contest ISA in a single dependency-free main.ts — 32-bit wrapping arithmetic, a 256-entry stack, calls, 256 words of memory, input/output, all ten traps with their exit codes, and the step and output limits.

This implementation was written by GPT-6.2 Sol (served by TokenFuture) inside a small agent loop given the ISA spec and the practice set: first draft crashed on a truncated-program edge case, the fixed second draft scores a perfect 40,000/40,000 on the practice set (official local grade 1,000,000). It is a second, independent implementation alongside our first entry, hedging edge cases the practice set does not cover.

## Run

The grader supplies instances under /input (or $MAKEFUN_INPUT_DIR) and reads answers from /output (or $MAKEFUN_OUTPUT_DIR). Requires Node.js 22. No dependencies, no network.
