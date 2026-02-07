import type { LcdEmotion } from '../types'

interface RobotFaceProps {
  emotion: LcdEmotion
  emergency?: boolean
}

export function RobotFace({ emotion, emergency = false }: RobotFaceProps) {
  const classes = ['robot-face', `robot-face--${emotion}`]
  if (emergency) {
    classes.push('robot-face--emergency')
  }

  return (
    <div className={classes.join(' ')} aria-hidden="true">
      <div className="robot-face__eyes">
        <span />
        <span />
      </div>
      <span className="robot-face__mouth" />
      {emotion === 'sleep' && <span className="robot-face__sleep-tag">Zz</span>}
    </div>
  )
}
