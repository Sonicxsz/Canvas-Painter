import { useRef, useState } from 'react'
import { Popup } from '../Popup/Popup'
import "./weight-picker.css"
export function WeightPicker({ className ="", value = 4, onChange = (val:number) => {} }) {
    const [visible,setVisible] = useState(false)
    const ref = useRef<HTMLDivElement | null>(null)
 
    const onClick = () => {
        setVisible(true)
    }

    return <>
    <div ref={ref} onClick={onClick} className={`weight_picker_wrapper ${className}`}>
        <div className='weight_picker__viewer' style={{width: value *3, height: value * 3}}></div>
    </div>
     {visible && ref.current && (
            <Popup onClose={() => setVisible(false)} parent={ref}>
                <div className='weight-modal' >
                    {items.map(el => {
                        return <div key={el} onClick={() => onChange(el)} className='weight-modal__item'>{el}</div>
                    })}
                </div>
            </Popup>
        )}
    </>
}


const items = [4,6,8,12]
