import Image, { ImageProps } from 'next/image'

export const Icons = {
    logo: (props: ImageProps) => (
        <Image {...props} alt="Logo" />
    )
}