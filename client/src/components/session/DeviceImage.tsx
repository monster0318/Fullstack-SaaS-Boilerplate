import { Monitor, Laptop, DeviceTablet, DeviceMobile, AndroidLogo, WindowsLogo, Desktop } from "@phosphor-icons/react"

type Props = {
  className: string
  deviceName: "" | "iPhone" | "iPad" | "Android Device" | "Windows PC" | "Mac" | "Linux PC" | "Chromebook"
}

const DeviceImage = (props: Props) => {
  if (props.deviceName === "iPhone") return <DeviceMobile className={props.className} />
  if (props.deviceName === "Android Device") return <AndroidLogo className={props.className} />
  if (props.deviceName === "iPad") return <DeviceTablet className={props.className} />
  if (props.deviceName === "Windows PC") return <WindowsLogo className={props.className} />
  if (props.deviceName === "Mac") return <Desktop className={props.className} />
  if (props.deviceName === "Linux PC") return <Monitor className={props.className} />
  if (props.deviceName === "Chromebook") return <Laptop className={props.className} />

  return null
}

export default DeviceImage
