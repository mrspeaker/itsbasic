5 print "sprites", 20, 0
10 poke 1000, 1: poke 1001, 1
20 x = 0
30 poke 1021, cos(x / 60) * 60 + 100
35 poke 1022, sin(x / 100) * 60 + 130
40 x = x + 1
80 goto 30
