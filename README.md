# ItsBasic

It's basic.

##  Implemented:

    \# TEXT // comment
    x = 1
    x = y + 1
    == <> < > >= <=
    print "msg"
    print "msg", x, y
    goto 10
    if x < 10 then 20
    poke addr, value
    poke 2042, 1 // first screen char is A
    poke 3042, 2 // first scrren char background col is red
    peek 2042 // read the address
    rnd 20 // random int between 0 and 19
    data 1,2,3,4 // puts data into memory (writeLoc)
    read() //  reads data from memory (readLoc ) read must happen after data.
    cos, sin, tan, atan2
    mod
    con // console.log variable
    cls() // clear screen

----

## Problems

* return from rom binding only handles last statement.
* line numbers ignored (in init prog... need to sort/filter etc.)

---

## Thinkin'

printing moves the cursor pos.
have types? %, $?

---

## next todos:

change run/stop to real stop (break) and reset.
for loop
cursor pos should be in RAM.
set sprite data
if x < 10 then EXPR
input (keys)

---

## Mem locations

    0: background color
    1: foreground color
    2: data read location
    3: data write location
    4: screen cursor position
    5: current program line
    1000: sprites on/off
    1021: sprite x, y
    2042: screen char memory
    3042: screen back color
    4042: screen forecolor
    5000: default data location

# Notes

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
rect? circle? line? yeah!
gosub?
list, rnd,
save, load
stop

prog:
curLine: 0
lines: []
stack: []
env: {}
