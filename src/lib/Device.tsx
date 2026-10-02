import {
  DeviceSelect,
  DeviceContainer,
  DeviceHeading,
} from "../styles/components";
import type { MidiPortOption } from "../util/midi";

interface DeviceProps {
  device: string;
  deviceList: MidiPortOption[];
  setDevice: (deviceId: string) => void;
}

const Device = ({ device, deviceList, setDevice }: DeviceProps) => {
  return (
    <DeviceContainer>
      <DeviceHeading id="device-heading">MIDI Device:</DeviceHeading>
      <DeviceSelect
        id="midi-device"
        aria-labelledby="device-heading"
        value={device}
        onChange={(e) => setDevice(e.target.value)}
      >
        <option value="">Select Device...</option>
        {deviceList.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </DeviceSelect>
    </DeviceContainer>
  );
};

export default Device;
