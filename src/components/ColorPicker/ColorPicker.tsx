import { HexAlphaColorPicker } from 'react-colorful'
import { useRef, useState } from 'react'
import './color-picker.css'
import { Popup } from '../Popup/Popup'
export function HexColorPicker({ className ="", value = '#FFFF', onChange = (val:string) => {} }) {
    const [visible,setVisible] = useState(false)
    const ref = useRef<HTMLDivElement | null>(null)
 
    const onClick = () => {
        setVisible(true)
    }
    return <>
    <div ref={ref} onClick={onClick} style={{ backgroundColor: value }} className={`color_picker_wrapper ${className}`}>
       
    </div>
     {visible && ref.current && (
            <Popup onClose={() => setVisible(false)} parent={ref}>
                <HexAlphaColorPicker color={value} onChange={onChange} />
            </Popup>
        )}
    </>
}
