
one font.
some ascii symbols? standard ascii.

cols: 0-15
screen memory: char Wx char H x ascii size. peek to get value
color memory: charW x charH x cols. peek to get value
gfx memory: WxHxcols
program data:
vars:a-z
types: number, string, array, function

numSprites
sprite enable bit: numSprites
sprite color: numSprites, cols
sprite data pointer: hmmm.
sprite pos x:
sprite pos y:
sprite scale:
sprite rotate?
sprite collisions

poke, peek
read, data, restore
time, date
cls
for, next, if then else
not or and xor
math funcs... / + - * = < > sin cos atan2
exp, mod
input
rect? circle?
gosub?
list, rnd,
save, load
stop


prog:
curLine: 0
lines: []
stack: []
env: {}
