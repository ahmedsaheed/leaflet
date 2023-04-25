import { useState } from 'react';

export const useFontToggle = () => {
    const [font, setFont] = useState('sans');
    
    const toggleFont = () => {
        setFont((prevFont) => (prevFont === 'sans' ? 'mono' : 'sans'));
    }

        return [font, toggleFont];
}
