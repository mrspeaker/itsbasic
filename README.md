# ItsBasic

It's basic.

![co6ap4vweam4dmx](https://cloud.githubusercontent.com/assets/129330/9934191/bf63ba48-5d1d-11e5-9f0f-9b36b2d3e987.png)

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

    run
    list
    cls
    load // load "$" for listing
    save // loast on refresh!

----

## Problems

* return from rom binding only handles last statement.
* several variable look-ups in a row crash things: "10 a a a a a"
* 10 goto 10 locks up browser.  

---

## Thinkin'

* move more towards QBasic drawing... better for the game.
have types? %, $?

---

## next todos:

* can't have ? in strings.
* write tests for parse
* write tests for eval
* runstop/restore (double escape?)

* for loop
* set sprite data
* if x < 10 then EXPR
* input (keys)
* shortcuts for pokes for sprites etc. // Eh, just do QBasic!
  - eg, poke 2042, 1 === spron 1, 1
  - eg, poke 2042, 0 === spron 1, 0
* scrolling

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

    * some ascii symbols? standard ascii.

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
