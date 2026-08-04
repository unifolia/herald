import { useState, useEffect, useRef, useCallback } from "react";
import { toSafeMidiChannel, toSafeMidiValue } from "../util/midi";

interface UseMIDIOptions {
  onCC?: (channel: number, cc: number, value: number) => void;
}

interface UseMIDIReturn {
  deviceList: string[];
  device: string;
  setDevice: (device: string) => void;
  isMidiOutput: boolean;
  sendCC: (channel: number, cc: number, value: number) => void;
  sendPC: (channel: number, program: number) => void;
}

const useMIDI = ({ onCC }: UseMIDIOptions = {}): UseMIDIReturn => {
  const [deviceList, setDeviceList] = useState<string[]>([]);
  const [device, setDevice] = useState("");
  const [isMidiOutput, setIsMidiOutput] = useState(false);

  const midiAccessRef = useRef<MIDIAccess | null>(null);
  const deviceRef = useRef(device);
  const onCCRef = useRef(onCC);

  useEffect(() => {
    deviceRef.current = device;
  }, [device]);

  useEffect(() => {
    onCCRef.current = onCC;
  }, [onCC]);

  const updateDeviceList = useCallback((midiAccess: MIDIAccess) => {
    const outputs = Array.from(midiAccess.outputs.values());

    if (outputs.length === 0) {
      setIsMidiOutput(false);
      setDeviceList([]);
      setDevice("");
      return;
    }

    setIsMidiOutput(true);

    const names = [
      ...new Set(
        outputs
          .map((output) => output.name)
          .filter((name): name is string => name !== null && name !== ""),
      ),
    ];
    setDeviceList(names);

    if (!names.includes(deviceRef.current)) {
      setDevice("");
    }
  }, []);

  const attachInputListeners = useCallback((midiAccess: MIDIAccess) => {
    for (const input of midiAccess.inputs.values()) {
      input.onmidimessage = (event: MIDIMessageEvent) => {
        if (!event.data || event.data.length < 3) return;

        const [status, data1, data2] = event.data;
        const command = status >> 4;

        if (command === 11) {
          const channel = (status & 0x0f) + 1;
          onCCRef.current?.(channel, data1, data2);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      return;
    }

    let cancelled = false;
    let acquired: MIDIAccess | null = null;

    navigator.requestMIDIAccess().then(
      (midiAccess) => {
        if (cancelled) return;
        acquired = midiAccess;
        midiAccessRef.current = midiAccess;
        updateDeviceList(midiAccess);
        attachInputListeners(midiAccess);

        midiAccess.onstatechange = () => {
          updateDeviceList(midiAccess);
          attachInputListeners(midiAccess);
        };
      },
      () => {},
    );

    return () => {
      cancelled = true;
      if (acquired) {
        acquired.onstatechange = null;
        for (const input of acquired.inputs.values()) {
          input.onmidimessage = null;
        }
      }
    };
  }, [updateDeviceList, attachInputListeners]);

  const getOutput = useCallback((): MIDIOutput | undefined => {
    const midiAccess = midiAccessRef.current;
    if (!midiAccess) return undefined;
    return Array.from(midiAccess.outputs.values()).find(
      (o) => o.name === deviceRef.current,
    );
  }, []);

  const sendCC = useCallback(
    (channel: number, cc: number, value: number) => {
      const safeChannel = toSafeMidiChannel(channel);
      const safeCC = toSafeMidiValue(cc);
      const safeValue = toSafeMidiValue(value);
      if (safeChannel === null || safeCC === null || safeValue === null) return;

      getOutput()?.send([0xb0 + safeChannel - 1, safeCC, safeValue]);
    },
    [getOutput],
  );

  const sendPC = useCallback(
    (channel: number, program: number) => {
      const safeChannel = toSafeMidiChannel(channel);
      const safeProgram = toSafeMidiValue(program);
      if (safeChannel === null || safeProgram === null) return;

      getOutput()?.send([0xc0 + safeChannel - 1, safeProgram]);
    },
    [getOutput],
  );

  return { deviceList, device, setDevice, isMidiOutput, sendCC, sendPC };
};

export default useMIDI;
