# Tic-Tac-Decay

**Tic-Tac-Decay** is a modified version of the classic Tic Tac Toe game. Inspired by the traditional 3x3 grid format, it introduces a new gameplay mechanic. In this variation, every third move by a player triggers a decay effect where their oldest active mark is removed from the board, given that no win has occurred yet. This continuous decay loop prevents players from relying on long-term board control and forces them to play more dynamically and tactically.

👉 **Play it now:** [https://siieegee.github.io/tic-tac-decay/](https://siieegee.github.io/tic-tac-decay/)

## Concept

Unlike traditional Tic-Tac-Toe, in **Tic-Tac-Decay**, the grid isn't stable. Over time (or turns), cells can *decay*, making previous moves disappear and altering the game state dynamically. Think fast, plan smarter!

## Features

- 2-player gameplay (Player vs Player AI)
- Decaying cells that remove the oldest move after the third turn
- Game state resets and win/draw detection
- Simple UI with visual feedback on decayed cells

## Technologies

- Language: `HTML, CSS, and JavaScript`
- Version control: Git & GitHub

## Installation

```bash
git clone https://github.com/siieegee/tic-tac-decay.git
cd tic-tac-decay
