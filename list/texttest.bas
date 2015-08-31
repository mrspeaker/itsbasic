10 x=0 : y=0:z=20: w=0: v=2042:
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
35 x=x+1:y=y+41:w=w+1:
40 if x < z then 20
50 goto 10
