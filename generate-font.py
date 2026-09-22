"""Original uppercase display alphabet for Mun Wai Space. No source font used.
Broad proportions and softened architectural strokes link open, social forms
with a consistent underlying construction. Requires fonttools + brotli.
"""
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
import math,pathlib,json
letters={
'A':[[(65,0),(315,700),(565,0)],[(150,260),(480,260)]],
'B':[[(70,0),(70,700),(390,700),(545,580),(545,455),(420,355),(70,355)],[(420,355),(565,235),(565,120),(430,0),(70,0)]],
'C':[[(555,595),(445,700),(190,700),(65,575),(65,125),(190,0),(445,0),(555,105)]],
'D':[[(70,0),(70,700),(365,700),(560,520),(560,180),(365,0),(70,0)]],
'E':[[(550,700),(70,700),(70,0),(550,0)],[(70,350),(460,350)]],
'F':[[(70,0),(70,700),(550,700)],[(70,350),(450,350)]],
'G':[[(550,600),(440,700),(190,700),(65,575),(65,125),(190,0),(450,0),(555,110),(555,310),(360,310)]],
'H':[[(70,0),(70,700)],[(555,0),(555,700)],[(70,350),(555,350)]],
'I':[[(155,700),(475,700)],[(315,700),(315,0)],[(155,0),(475,0)]],
'J':[[(555,700),(555,140),(420,0),(210,0),(75,140)]],
'K':[[(70,0),(70,700)],[(555,700),(70,310)],[(285,480),(570,0)]],
'L':[[(70,700),(70,0),(550,0)]],
'M':[[(65,0),(65,700),(385,270),(705,700),(705,0)]],
'N':[[(70,0),(70,700),(555,0),(555,700)]],
'O':[[(190,0),(65,130),(65,570),(190,700),(435,700),(565,570),(565,130),(435,0),(190,0)]],
'P':[[(70,0),(70,700),(420,700),(555,575),(555,420),(420,300),(70,300)]],
'Q':[[(190,0),(65,130),(65,570),(190,700),(435,700),(565,570),(565,130),(435,0),(190,0)],[(380,180),(600,-40)]],
'R':[[(70,0),(70,700),(420,700),(555,575),(555,420),(420,300),(70,300)],[(340,300),(565,0)]],
'S':[[(555,610),(440,700),(190,700),(65,570),(65,450),(190,350),(435,350),(565,240),(565,120),(440,0),(180,0),(65,100)]],
'T':[[(30,700),(600,700)],[(315,700),(315,0)]],
'U':[[(65,700),(65,135),(195,0),(430,0),(565,135),(565,700)]],
'V':[[(50,700),(315,0),(580,700)]],
'W':[[(45,700),(180,0),(385,400),(590,0),(725,700)]],
'X':[[(65,700),(565,0)],[(565,700),(65,0)]],
'Y':[[(50,700),(315,350),(580,700)],[(315,350),(315,0)]],
'Z':[[(65,700),(555,700),(65,0),(555,0)]],
'.':[[(95,0),(100,0)]],
'-':[[(120,320),(510,320)]],
}
# Soften the bowls. The straight structural letters retain the distinctive
# broad M/W while curved letters use an original elliptical construction.
def arc(cx,cy,rx,ry,start,end,count=42):
 return [(cx+rx*math.cos(math.radians(start+(end-start)*i/count)),cy+ry*math.sin(math.radians(start+(end-start)*i/count))) for i in range(count+1)]
letters['O']=[arc(315,350,250,350,0,360)]
letters['C']=[arc(315,350,250,350,43,317)]
letters['G']=[arc(315,350,250,350,43,360)+[(565,300),(365,300)]]
letters['Q']=[arc(315,350,250,350,0,360),[(380,180),(600,-40)]]
letters['D']=[[(70,0),(70,700),(290,700)]+arc(290,350,270,350,90,-90)+[(70,0)]]
letters['P']=[[(70,0),(70,700),(345,700)]+arc(345,500,210,200,90,-90)+[(70,300)]]
letters['R']=letters['P']+[[(340,300),(565,0)]]
letters['B']=[[(70,0),(70,700),(335,700)]+arc(335,525,205,175,90,-90)+[(70,350)],[(335,350)]+arc(335,175,230,175,90,-90)+[(70,0)]]
letters['U']=[[(65,700),(65,225)]+arc(315,225,250,225,180,360)+[(565,700)]]
letters['J']=[[(555,700),(555,220)]+arc(315,220,240,220,0,-180)]
letters['S']=[arc(315,535,250,165,25,270)+arc(315,175,250,175,90,-155)]
# Handle and journey numerals extend the original alphabet in the same stroke.
letters['0']=[arc(315,350,235,350,0,360)]
letters['1']=[[(160,535),(315,700),(315,0)],[(140,0),(485,0)]]
letters['2']=[arc(315,505,240,195,180,-45)+[(75,0),(560,0)]]
letters['3']=[[(90,700),(525,700),(290,380)]+arc(310,185,240,185,95,-150)]
letters['4']=[[(450,0),(450,700),(65,220),(575,220)]]
letters['5']=[[(545,700),(95,700),(80,365)]+arc(305,185,245,185,145,-155)]
letters['6']=[arc(315,365,235,335,65,270),arc(315,215,235,215,0,360)]
letters['7']=[[(65,700),(565,700),(215,0)]]
letters['8']=[arc(315,520,220,180,0,360),arc(315,175,245,175,0,360)]
letters['9']=[arc(315,335,235,335,-115,90),arc(315,485,235,215,0,360)]
letters['@']=[arc(315,350,270,320,5,325),arc(300,360,125,175,0,360),[(425,535),(425,235),(525,235),(585,310)]]
glyphs={};metrics={};cmap={32:'space'}
def disc(p,x,y,r):
 p.moveTo((x+r,y));p.qCurveTo((x+r,y+r),(x,y+r));p.qCurveTo((x-r,y+r),(x-r,y));p.qCurveTo((x-r,y-r),(x,y-r));p.qCurveTo((x+r,y-r),(x+r,y));p.closePath()
for ch,paths in letters.items():
 p=TTGlyphPen(None);r=43
 for points in paths:
  for (x1,y1),(x2,y2) in zip(points,points[1:]):
   length=math.hypot(x2-x1,y2-y1)
   if length < .001: continue
   dx=-(y2-y1)/length*r;dy=(x2-x1)/length*r
   p.moveTo((x1+dx,y1+dy));p.lineTo((x1-dx,y1-dy));p.lineTo((x2-dx,y2-dy));p.lineTo((x2+dx,y2+dy));p.closePath()
  for x,y in points:disc(p,x,y,r)
 name='uni%04X'%ord(ch);glyphs[name]=p.glyph();metrics[name]=(820 if ch in 'MW' else 235 if ch=='.' else 675,15);cmap[ord(ch)]=name
 if ch.isalpha():cmap[ord(ch.lower())]=name
for name in ['.notdef','space']:
 p=TTGlyphPen(None);glyphs[name]=p.glyph();metrics[name]=(300,0)
fb=FontBuilder(1000,isTTF=True);fb.setupGlyphOrder(['.notdef','space']+[x for x in glyphs if x not in ['.notdef','space']]);fb.setupCharacterMap(cmap);fb.setupGlyf(glyphs);fb.setupHorizontalMetrics(metrics);fb.setupHorizontalHeader(ascent=820,descent=-180);fb.setupNameTable({'familyName':'Mun Wai Assembly','styleName':'Regular','uniqueFontIdentifier':'MunWaiAssembly-Original-2026','fullName':'Mun Wai Assembly Regular','psName':'MunWaiAssembly-Regular','version':'Version 1.0'});fb.setupOS2(sTypoAscender=820,sTypoDescender=-180,usWinAscent=820,usWinDescent=180);fb.setupPost();fb.setupMaxp()
dest=pathlib.Path(__file__).parent/'public/fonts';dest.mkdir(parents=True,exist_ok=True);fb.save(dest/'mun-wai-assembly.ttf');fb.font.flavor='woff2';fb.save(dest/'mun-wai-assembly.woff2');print('Generated Mun Wai Assembly: A-Z, a-z uppercase aliases, digits, @, period, hyphen.')
# Share the original pen routes with the writing animation. These are the
# same authored centrelines as the font, aligned to its actual side bearings.
ink = {'unitsPerEm':1000,'ascent':820,'descent':180,'glyphs':{}}
for ch,paths in letters.items():
 name=cmap[ord(ch)];glyph=fb.font['glyf'][name];glyph.recalcBounds(fb.font['glyf'])
 advance,lsb=metrics[name];offset=lsb-glyph.xMin
 strokes=[]
 for points in paths:
  route=[(round(x+offset,2),round(820-y,2)) for x,y in points]
  d='M'+' L'.join(f'{x:g},{y:g}' for x,y in route)
  length=sum(math.hypot(b[0]-a[0],b[1]-a[1]) for a,b in zip(route,route[1:]))
  strokes.append({'d':d,'length':round(length,2),'width':90})
 ink['glyphs'][ch]={'advance':advance,'bounds':[glyph.xMin+offset,820-glyph.yMax,glyph.xMax+offset,820-glyph.yMin],'strokes':strokes}
ink_path=pathlib.Path(__file__).parent/'src/ink-assembly.json'
ink_path.write_text(json.dumps(ink,separators=(',',':'))+'\n')
print('Exported original Assembly writing paths.')
