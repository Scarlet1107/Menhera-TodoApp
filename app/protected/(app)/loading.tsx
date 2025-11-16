import Image from 'next/image'

const Loading = () => {
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <Image
                src="/loading/icon.svg"
                width={300}
                height={300}
                alt=""
                className="animate-float animate-flip-y"
            />
        </div>
    )
}

export default Loading
