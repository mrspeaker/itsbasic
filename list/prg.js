module.exports = [['classic',`
10 print "mrspeaker rulez  "
20 goto 10
`],

['text cols', `1 # text colors
10 x=0 : y=0: z=20: w=0: v=2042
15 poke 1000, 1
16 poke 1021, 50: poke 1022, 50
20 poke v+y, x
21 poke v+y+1, x+1
22 poke v+y+2, x+2
23 poke v+1000+x, w
24 poke 0, w
25 poke 1, w + 1
28 poke 1021,w * 3
29 poke 1022,w
30 print "hey", rnd(25) + 10, x
35 x=x+1: y=y+41: w=w+1
40 if x < z then 20
50 goto 10
`],

['peek value', `
10 print "b"
15 x = "peeked val " + peek 2042
20 print x, 2, 2
`],

/*
Examples

10 DATA 1,2,3,Apple,"Commodore 64"
20 READ A
30 READ B%, C, D$
40 READ E$
50 PRINT A, B%, C, D$, E$

10 FOR X=0 TO 10: READ A(X): PRINT A(X),;:NEXT
20 DATA 10,20,30,40,50,60,70,80,90,100,110

*/
['read data', `
10 data "hi", "there", "what", "what"
20 x = 0
30 y = read()
40 print y + " "
50 x = x +1
60 if x < 4 then 30
`],

['sprites',`
1 cls()
5 print "sprites", 20, 0
10 poke 1000, 1: poke 1001, 1
20 x = 0
30 poke 1021, cos(x / 60) * 60 + 100
35 poke 1022, sin(x / 100) * 60 + 130
40 x = x + 1
80 goto 30
`]
];
