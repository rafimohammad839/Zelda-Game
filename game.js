kaboom({
  global: true,
  fullscreen: true,
  scale: 0.6,
  debug: true,
  clearColor: [0, 0, 0, 1]
})

const MOVE_SPEED = 120
const SLICER_SPEED = 120
const SKELETOR_SPEED = 60

loadRoot('https://i.imgur.com/')
loadSprite('link-going-left', '1Xq9biB.png')
loadSprite('link-going-right', 'yZIb8O2.png')
loadSprite('link-going-down', 'r377FIM.png')
loadSprite('link-going-up', 'UkV0we0.png')
loadSprite('left-wall', 'rfDoaa1.png')
loadSprite('right-wall', 'SmHhgUn.png')
loadSprite('top-wall', 'QA257Bj.png')
loadSprite('bottom-wall', 'vWJWmvb.png')
loadSprite('bottom-left-wall', 'awnTfNC.png')
loadSprite('bottom-right-wall', '84oyTFy.png')
loadSprite('top-left-wall', 'xlpUxIm.png')
loadSprite('top-right-wall', 'z0OmBd1.png')
loadSprite('top-door', 'U9nre4n.png')
loadSprite('left-door', 'okdJNls.png')
loadSprite('fire-pot', 'wiSiY09.png')
loadSprite('lanterns', 'I7xSp7w.png')
loadSprite('slicer', 'c6JFi5Z.png')
loadSprite('skeletor', 'Ei1VnX8.png')
loadSprite('stairs', 'VghkL08.png')
loadSprite('kaboom', 'o9WizfI.png')
loadSprite('bg', 'u4DVsx6.png')

scene('game', ({ level, score }) => {
  layers(['layer', 'bg', 'obj'], 'obj')


  const maps = [
    [
      'ycc)cc^ccw',
      'a        b',
      'a      * b',
      'a    (   b',
      '%        b',
      'a    (   b',
      'a   *    b',
      'a        b',
      'xdd)dd)ddy',
    ],
    [
      'yccccccccw',
      'a        b',
      ')        )',
      'a        b',
      'a        b',
      'a    $   b',
      ')    }   b',
      'a        b',
      'xddddddddz',
    ]
  ]



  const levelCfg = {
    width: 48,
    height: 48,
    'a': [sprite('left-wall'), solid(), 'wall'],
    'b': [sprite('right-wall'), solid(), 'wall'],
    'c': [sprite('top-wall'), solid(), 'wall'],
    'd': [sprite('bottom-wall'), solid(), 'wall'],
    'w': [sprite('top-right-wall'), solid(), 'wall'],
    'x': [sprite('bottom-left-wall'), solid(), 'wall'],
    'y': [sprite('top-left-wall'), solid(), 'wall'],
    'z': [sprite('bottom-right-wall'), solid(), 'wall'],
    '%': [sprite('left-door')],
    '^': [sprite('top-door'), 'next-level'],
    '$': [sprite('stairs'), 'next-level'],
    '*': [sprite('slicer'), 'slicer', 'dangerous', { dir: -1 }],
    '}': [sprite('skeletor'), 'skeletor', 'dangerous', { dir: -1, timer: 0 }],
    '(': [sprite('lanterns'), solid()],
    ')': [sprite('fire-pot'), solid()],
  }

  addLevel(maps[level], levelCfg)

  add([sprite('bg'), layer('bg')])

  const scoreLabel = add([
    text('0'),
    pos(400, 450),
    layer('ui'),
    {
      value: score,
    },
    scale(4)
  ])


  const player = add([
    sprite('link-going-right'),
    pos(5, 190),
    {
      dir: vec2(1, 0)
    }
  ])

  player.action(() => {
    player.resolve()
  })

  player.overlaps('next-level', () => {
    go('game', {
      level: (level + 1) % maps.length,
      score: scoreLabel.value
    })
  })


  keyDown('left', () => {
    player.changeSprite('link-going-left')
    player.move(-MOVE_SPEED, 0)
    player.dir = vec2(-1, 0)
  })

  keyDown('right', () => {
    player.changeSprite('link-going-right')
    player.move(MOVE_SPEED, 0)
    player.dir = vec2(1, 0)
  })

  keyDown('up', () => {
    player.changeSprite('link-going-up')
    player.move(0, -MOVE_SPEED)
    player.dir = vec2(0, -1)
  })

  keyDown('down', () => {
    player.changeSprite('link-going-down')
    player.move(0, MOVE_SPEED)
    player.dir = vec2(0, 1)
  })

  function spawnKaboom(p) {
    const obj = add([sprite('kaboom'), pos(p), 'kaboom'])
    wait(1, () => {
      destroy(obj)
    })
  }

  keyPress('space', () => {
    spawnKaboom(player.pos.add(player.dir.scale(48)))
  })

  action('slicer', (s) => {
    s.move(s.dir * SLICER_SPEED, 0)
  })

  collides('dangerous', 'wall', (s) => {
    s.dir = -s.dir
  })

  action('skeletor', (s) => {
    s.move(0, s.dir * SKELETOR_SPEED)
    s.timer -= dt()
    if (s.timer <= 0)
      s.dir = -s.dir
    s.timer = rand(5)
  })

  collides('kaboom', 'skeletor', (k, s) => {
    camShake(4)
    wait(1, () => {
      destroy(k)
    })
    destroy(s)
    scoreLabel.value++
    scoreLabel.text = scoreLabel.value
  })

  player.overlaps('dangerous', () => {
    go('lose', { score: scoreLabel.value })
  })
})

scene('lose', ({ score }) => {
  add([text(score, 32), origin('center'), pos(width() / 2, height() / 2)])
})

start('game', { level: 0, score: 0 })