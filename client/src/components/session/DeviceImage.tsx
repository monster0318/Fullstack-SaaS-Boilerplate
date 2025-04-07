import { Monitor, Laptop, Tablet, Smartphone } from "lucide-react"

type Props = {
  className: string
  deviceName: "" | "iPhone" | "iPad" | "Android Device" | "Windows PC" | "Mac" | "Linux PC" | "Chromebook"
}

const DeviceImage = (props: Props) => {
  if (props.deviceName === "iPhone") return <Smartphone className={props.className} />
  if (props.deviceName === "Android Device") return <Smartphone className={props.className} />
  if (props.deviceName === "iPad") return <Tablet className={props.className} />
  if (props.deviceName === "Windows PC") return <Monitor className={props.className} />
  if (props.deviceName === "Mac") return <Monitor className={props.className} />
  if (props.deviceName === "Linux PC") return <Monitor className={props.className} />
  if (props.deviceName === "Chromebook") return <Laptop className={props.className} />

  return null
}

export default DeviceImage
