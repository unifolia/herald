import { useState, useEffect, useRef, useCallback } from "react";
import {
  labelMidiPorts,
  toSafeMidiChannel,
  toSafeMidiValue,
  type MidiPortOption,
} from "../util/midi";

export type MidiStatus = "pending" | "unsupported" | "blocked" | "ready";

interface UseMIDIOptions {
  onCC?: (channel: number, cc: number, value: number) => void;
}

interface UseMIDIReturn {
  status: MidiStatus;
  deviceList: MidiPortOption[];
  device: string;
  setDevice: (deviceId: string) => void;
  sendCC: (channel: number, cc: number, value: number) => void;
  sendPC: (channel: number, program: number) => void;
}

const getInitialStatus = (): MidiStatus =>
  typeof navigator !== "undefined" &&
  typeof navigator.requestMIDIAccess === "function"
    ? "pending"
    : "unsupported";

const useMIDI = ({ onCC }: UseMIDIOptions = {}): UseMIDIReturn => {
  const [status, setStatus] = useState<MidiStatus>(getInitialStatus);
  const [deviceList, setDeviceList] = useState<MidiPortOption[]>([]);
  const [device, setDevice] = useState("");

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
    const outputs = Array.from(midiAccess.outputs.values()).filter(
      (output) => output.state === "connected",
    );

    setDeviceList(labelMidiPorts(outputs));

    if (!outputs.some((output) => output.id === deviceRef.current)) {
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
    if (typeof navigator.requestMIDIAccess !== "function") {
      return;
    }

    let cancelled = false;
    let acquired: MIDIAccess | null = null;

    navigator.requestMIDIAccess().then(
      (midiAccess) => {
        if (cancelled) return;
        acquired = midiAccess;
        midiAccessRef.current = midiAccess;
        setStatus("ready");
        updateDeviceList(midiAccess);
        attachInputListeners(midiAccess);

        midiAccess.onstatechange = () => {
          updateDeviceList(midiAccess);
          attachInputListeners(midiAccess);
        };
      },
      () => {
        if (!cancelled) setStatus("blocked");
      },
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

  const send = useCallback((message: number[]) => {
    const deviceId = deviceRef.current;
    if (!deviceId) return;

    const output = midiAccessRef.current?.outputs.get(deviceId);
    if (!output || output.state !== "connected") return;

    try {
      output.send(message);
    } catch (error) {
      console.error("MIDI send failed:", error);
    }
  }, []);

  const sendCC = useCallback(
    (channel: number, cc: number, value: number) => {
      const safeChannel = toSafeMidiChannel(channel);
      const safeCC = toSafeMidiValue(cc);
      const safeValue = toSafeMidiValue(value);
      if (safeChannel === null || safeCC === null || safeValue === null) return;

      send([0xb0 + safeChannel - 1, safeCC, safeValue]);
    },
    [send],
  );

  const sendPC = useCallback(
    (channel: number, program: number) => {
      const safeChannel = toSafeMidiChannel(channel);
      const safeProgram = toSafeMidiValue(program);
      if (safeChannel === null || safeProgram === null) return;

      send([0xc0 + safeChannel - 1, safeProgram]);
    },
    [send],
  );

  return { status, deviceList, device, setDevice, sendCC, sendPC };
};

export default useMIDI;
