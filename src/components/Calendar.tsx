import FullCalendar, {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState, useEffect } from "react";
import { useTimetable, PersonalBlock } from "../store/useTimetable";
import { BlockModal } from "./BlockModal";
import { toast } from "react-toastify";
import { launchConfetti } from "../utils/confetti";

export const Calendar = () => {
  const {
    user,
    blocks,
    addBlock,
    updateBlockStatus,
    deleteBlock,
    loading,
  } = useTimetable();

  const [isModalOpen, setModalOpen] = useState(false);
  const [editBlock, setEditBlock] = useState<PersonalBlock | null>(null);
  const [selectInfo, setSelectInfo] = useState<DateSelectArg | null>(null);

  const handleDateSelect = (info: DateSelectArg) => {
    setSelectInfo(info);
    setEditBlock(null);
    setModalOpen(true);
  };

  const handleSave = async (data: Omit<PersonalBlock, "id" | "status" | "createdAt">) => {
    await addBlock(data);
    toast.success("Block added! 🎉");
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    const block = blocks.find((b) => b.id === eventInfo.event.id);
    const isCollege = eventInfo.event.extendedProps?.college === true;

    return (
      <div className="flex items-center justify-between w-full">
        <span className="truncate">{eventInfo.event.title}</span>
        {!isCollege && block && (
          <select
            value={block.status}
            onChange={(e) => {
              const newStatus = e.target.value as BlockStatus;
              updateBlockStatus(block.id, newStatus);
              if (newStatus === "done") {
                toast.success("Well done! ✅");
                launchConfetti();
              }
            }}
            className="text-xs bg-white border rounded"
          >
            <option value="pending">⏳</option>
            <option value="done">✅</option>
            <option value="skipped">❌</option>
          </select>
        )}
      </div>
    );
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const block = blocks.find((b) => b.id === clickInfo.event.id);
    if (!block) return; // college block – ignore
    setEditBlock(block);
    setModalOpen(true);
  };

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const block = blocks.find((b) => b.id === dropInfo.event.id);
    if (!block) return;
    await deleteBlock(block.id);
    await addBlock({
      title: block.title,
      subject: block.subject,
      start: dropInfo.event.start?.toISOString() ?? block.start,
      end: dropInfo.event.end?.toISOString() ?? block.end,
      color: block.color,
    });
    toast.info("Block moved");
  };

  /* ---------- Sample static college blocks (replace with Firestore later) ---------- */
  const collegeEvents = [
    {
      id: "c-1",
      title: "CS101 Lecture",
      start: "2026-03-02T09:00:00",
      end: "2026-03-02T10:30:00",
      backgroundColor: "#4A90E2",
      borderColor: "#4A90E2",
      extendedProps: { college: true },
    },
    // add more static lecture blocks here or pull from Firestore
  ];

  const calendarEvents = [
    ...collegeEvents,
    ...blocks.map((b) => ({
      id: b.id,
      title: b.title,
      start: b.start,
      end: b.end,
      backgroundColor: b.color,
      borderColor: b.color,
    })),
  ];

  return (
    <div className="p-4 bg-white rounded shadow">
      {loading && <p className="text-center">Loading…</p>}

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        selectable={!!user}
        editable={!!user}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        events={calendarEvents}
        eventContent={renderEventContent}
        height="auto"
        slotMinTime="08:00:00"
        slotMaxTime="22:00:00"
      />

      <BlockModal
        isOpen={isModalOpen}
        onRequestClose={() => setModalOpen(false)}
        editBlock={editBlock}
        onSave={async (data) => {
          if (editBlock) await deleteBlock(editBlock.id);
          await handleSave(data);
        }}
      />
    </div>
  );
};
