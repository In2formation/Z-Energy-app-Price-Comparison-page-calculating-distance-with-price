// ----- IMPORTS ----- //
import styles from './Button.module.css';
import { BsArrowRightCircleFill } from 'react-icons/bs';
import { MdLocationPin } from 'react-icons/md';
import { FaDirections } from 'react-icons/fa'
import { HiArrowUpRight } from 'react-icons/hi2'
 
const icons = {
  arrow: <BsArrowRightCircleFill className={styles.iconArrow} />,
  contact: <MdLocationPin className={styles.iconContact} />,
  getDirections: <FaDirections className={styles.iconDirections} />,
  seeHow: <HiArrowUpRight className={styles.iconSeeHow} />
}

function Button({ text, variant, size, icon, onClick, className }) {

  return (
    <button className={`${styles.button} ${styles[variant]} ${styles[size]} ${className} || ""`}
    onClick={onClick}
    >
      {text}
      {icon && icons[icon]}
    </button>
  )
}

export default Button;

<Button
variant='outline'
size='small'
icon='contact'
text='contact us' />