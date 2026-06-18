import { useCallback, useMemo, useRef, useState } from "react";
import type { MidiCCFormData, MidiPCFormData } from "../types";
import type { ParsedPreset } from "../util/presetIo";

const INITIAL_CC_ID = 1;
const INITIAL_PC_ID = -1;

type FormEntry =
  | { type: "cc"; data: MidiCCFormData }
  | { type: "pc"; data: MidiPCFormData };

const createInitialCC = (backgroundColor: string): MidiCCFormData[] => [
  {
    id: INITIAL_CC_ID,
    midiChannel: 1,
    midiCC: 1,
    value: 64,
    label: "MIDI Control Block",
    backgroundColor,
  },
];

const createInitialPC = (backgroundColor: string): MidiPCFormData[] => [
  {
    id: INITIAL_PC_ID,
    midiChannel: 1,
    program: 0,
    label: "Program Change",
    backgroundColor,
  },
];

const usePresetBlocks = (initialBackgroundColor: string, maxBlocks: number) => {
  const [forms, setForms] = useState(() => ({
    name: "Untitled Preset",
    inputs: createInitialCC(initialBackgroundColor),
  }));
  const [pcForms, setPcForms] = useState<MidiPCFormData[]>(() =>
    createInitialPC(initialBackgroundColor),
  );
  const [formOrder, setFormOrder] = useState<number[]>([
    INITIAL_CC_ID,
    INITIAL_PC_ID,
  ]);
  const [globalMidiChannel, setGlobalMidiChannel] = useState<number | null>(
    null,
  );
  const nextIdRef = useRef(INITIAL_CC_ID + 1);
  const nextPcIdRef = useRef(INITIAL_PC_ID - 1);

  const blockCount = forms.inputs.length + pcForms.length;

  const allItems = useMemo(() => formOrder.map((id) => ({ id })), [formOrder]);

  const allFormsById = useMemo(() => {
    const map = new Map<number, FormEntry>();
    forms.inputs.forEach((form) =>
      map.set(form.id, { type: "cc", data: form }),
    );
    pcForms.forEach((form) =>
      map.set(form.id, { type: "pc", data: form }),
    );
    return map;
  }, [forms.inputs, pcForms]);

  const handleIncomingCC = useCallback(
    (channel: number, cc: number, value: number) => {
      setForms((prev) => ({
        ...prev,
        inputs: prev.inputs.map((form) =>
          form.midiChannel === channel && form.midiCC === cc
            ? { ...form, value }
            : form,
        ),
      }));
    },
    [],
  );

  const handleReorder = useCallback((reorderedIds: number[]) => {
    setFormOrder(reorderedIds);
    setForms((prev) => {
      const byId = new Map(prev.inputs.map((form) => [form.id, form]));
      return {
        ...prev,
        inputs: reorderedIds
          .map((id) => byId.get(id))
          .filter((form): form is MidiCCFormData => form !== undefined),
      };
    });
    setPcForms((prev) => {
      const byId = new Map(prev.map((form) => [form.id, form]));
      return reorderedIds
        .map((id) => byId.get(id))
        .filter((form): form is MidiPCFormData => form !== undefined);
    });
  }, []);

  const handleGlobalMidiChannelChange = useCallback(
    (newGlobalChannel: number) => {
      setGlobalMidiChannel(newGlobalChannel);
      setForms((prev) => ({
        ...prev,
        inputs: prev.inputs.map((form) => ({
          ...form,
          midiChannel: newGlobalChannel,
        })),
      }));
      setPcForms((prev) =>
        prev.map((pc) => ({ ...pc, midiChannel: newGlobalChannel })),
      );
    },
    [],
  );

  const getInheritedBlockDefaults = useCallback(() => {
    for (let i = formOrder.length - 1; i >= 0; i--) {
      const entry = allFormsById.get(formOrder[i]);
      if (entry) {
        return {
          backgroundColor: entry.data.backgroundColor,
          midiChannel: entry.data.midiChannel,
        };
      }
    }
    return { backgroundColor: initialBackgroundColor, midiChannel: 1 };
  }, [allFormsById, formOrder, initialBackgroundColor]);

  const handleAddCCInput = useCallback(() => {
    if (blockCount >= maxBlocks) return;

    const id = nextIdRef.current++;
    const { backgroundColor, midiChannel } = getInheritedBlockDefaults();
    setForms((prev) => ({
      ...prev,
      inputs: [
        ...prev.inputs,
        {
          id,
          midiChannel,
          midiCC: 1,
          value: 64,
          label: "MIDI Control Block",
          backgroundColor,
        },
      ],
    }));
    setFormOrder((prev) => [...prev, id]);
  }, [blockCount, getInheritedBlockDefaults, maxBlocks]);

  const handleRemoveCCForm = useCallback((id: number) => {
    setForms((prev) => ({
      ...prev,
      inputs: prev.inputs.filter((form) => form.id !== id),
    }));
    setFormOrder((prev) => prev.filter((formId) => formId !== id));
  }, []);

  const handleAddPCInput = useCallback(() => {
    if (blockCount >= maxBlocks) return;

    const id = nextPcIdRef.current--;
    const { backgroundColor, midiChannel } = getInheritedBlockDefaults();
    setPcForms((prev) => [
      ...prev,
      {
        id,
        midiChannel,
        program: 0,
        label: "Program Change",
        backgroundColor,
      },
    ]);
    setFormOrder((prev) => [...prev, id]);
  }, [blockCount, getInheritedBlockDefaults, maxBlocks]);

  const handleRemovePCForm = useCallback((id: number) => {
    setPcForms((prev) => prev.filter((pc) => pc.id !== id));
    setFormOrder((prev) => prev.filter((formId) => formId !== id));
  }, []);

  const updateCCFormField = useCallback(
    (id: number, field: keyof MidiCCFormData, value: string | number) => {
      setForms((prev) => ({
        ...prev,
        inputs: prev.inputs.map((form) =>
          form.id === id ? { ...form, [field]: value } : form,
        ),
      }));
    },
    [],
  );

  const updatePCFormField = useCallback(
    (id: number, field: keyof MidiPCFormData, value: string | number) => {
      setPcForms((prev) =>
        prev.map((form) =>
          form.id === id ? { ...form, [field]: value } : form,
        ),
      );
    },
    [],
  );

  const updateCCValues = useCallback((valuesById: Map<number, number>) => {
    setForms((prev) => {
      let changed = false;
      const inputs = prev.inputs.map((form) => {
        const value = valuesById.get(form.id);
        if (value === undefined || value === form.value) return form;

        changed = true;
        return { ...form, value };
      });

      return changed ? { ...prev, inputs } : prev;
    });
  }, []);

  const randomizeCCValues = useCallback(() => {
    const randomizedInputs = forms.inputs.map((form) => ({
      ...form,
      value: Math.floor(Math.random() * 128),
    }));

    setForms((prev) => ({
      ...prev,
      inputs: randomizedInputs,
    }));

    return randomizedInputs;
  }, [forms.inputs]);

  const setPresetName = useCallback((name: string) => {
    setForms((prev) => ({ ...prev, name }));
  }, []);

  const setPresetState = useCallback((preset: ParsedPreset) => {
    setForms({ name: preset.name, inputs: preset.inputs });
    nextIdRef.current = Math.max(...preset.inputs.map((form) => form.id), 0) + 1;
    setPcForms(preset.pcForms);
    nextPcIdRef.current =
      Math.min(...preset.pcForms.map((form) => form.id), 0) - 1;
    setFormOrder(preset.formOrder);
  }, []);

  return {
    forms,
    pcForms,
    formOrder,
    globalMidiChannel,
    blockCount,
    allItems,
    allFormsById,
    handleIncomingCC,
    handleAddCCInput,
    handleAddPCInput,
    handleRemoveCCForm,
    handleRemovePCForm,
    updateCCFormField,
    updatePCFormField,
    updateCCValues,
    randomizeCCValues,
    handleReorder,
    handleGlobalMidiChannelChange,
    setPresetName,
    setPresetState,
  };
};

export default usePresetBlocks;
