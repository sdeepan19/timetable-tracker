import Modal from "react-modal";
import { useState, useEffect } from "react";
import { PersonalBlock } from "../store/useTimetable";

type Props = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSave: (block: Omit<PersonalBlock, "id" | "status" | "createdAt">) => void;
  editBlock?: PersonalBlock | null;
};

export const BlockModal = ({ isOpen, onRequestClose, onSave, editBlock }: Props) => {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [color, setColor] = useState("#f5a623");

  useEffect(() => {
    if (editBlock) {
      setTitle(editBlock.title);
      setSubject(editBlock.subject);
      setStart(editBlock.start);
      setEnd(editBlock.end);
      setColor(editBlock.color);
    } else {
      setTitle("");
      setSubject("");
      setStart("");
      setEnd("");
      setColor("#f5a623");
    }
  }, [editBlock, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !start || !end) return;
    onSave({ title, subject, start, end, color });
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center"
      className="bg-white rounded p-6 w-96 mx-2"
      ariaHideApp={false}
    >
      <h2 className="text-xl font-semibold mb-4">{editBlock ? "Edit Block" : "Add New Block"}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input className="w-full border rounded p-1" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium">Subject / Category</label>
          <input className="w-full border rounded p-1" value={subject} onChange={e => setSubject(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium">Start</label>
            <input type="datetime-local" className="w-full border rounded p-1" value={start} onChange={e => setStart(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium">End</label>
            <input type="datetime-local" className="w-full border rounded p-1" value={end} onChange={e => setEnd(e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Color</label>
          <input type="color" className="w-10 h-10 p-0 border rounded" value={color} onChange={e => setColor(e.target.value)} />
        </div>

        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onRequestClose} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">
            Cancel
          </button>
          <button type="submit" className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700">
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};
