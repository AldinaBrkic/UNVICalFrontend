import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendar.css";

const localizer = momentLocalizer(moment);
const BASE_URL = "https://unvical.onrender.com";

// Right-click context menu
const ContextMenu = ({ x, y, event, onEdit, onDelete, onClose }) => {
  useEffect(() => {
    const handleOutsideClick = () => onClose();
    const handleEscape = (e) => e.key === "Escape" && onClose();

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("contextmenu", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("contextmenu", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div className="context-menu" style={{ top: y, left: x }}>
      <button onClick={() => { onEdit(event); onClose(); }}>Edit</button>
      <button onClick={() => { onDelete(event); onClose(); }} className="delete">
        Delete
      </button>
    </div>
  );
};

// Custom event – left click opens link, right click opens menu
const EventComponent = ({ event, onContextMenu }) => {
  const handleClick = (e) => {
    if (e.button === 0 && event.link) {
      e.stopPropagation();
      window.open(event.link, "_blank", "noopener,noreferrer");
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    onContextMenu(e.pageX, e.pageY, event);
  };

  return (
    <div
      className="event-item"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      style={{ cursor: event.link ? "pointer" : "default" }}
      title={event.link ? "Click to open link" : ""}
    >
      <span className="event-title">{event.title}</span>
    </div>
  );
};

function MyCalendar({ onLogout }) {
  const [events, setEvents] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [formData, setFormData] = useState({
    title: "",
    start: "",
    end: "",
    link: "",
    type: "online",
  });

  // Load events from backend
  useEffect(() => {
    fetch(`${BASE_URL}/api/events`)
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map((ev) => ({
          ...ev,
          start: new Date(ev.start),
          end: new Date(ev.end),
          title: `${ev.title} (${moment(ev.start).format("HH:mm")} - ${moment(ev.end).format("HH:mm")})`,
        }));
        setEvents(parsed);
      })
      .catch((err) => console.error("Error loading events:", err));
  }, []);

  // Delete event
  const handleDelete = async (event) => {
    const subjectName = event.title.split(" (")[0];
    if (!window.confirm(`Delete "${subjectName}"?`)) return;

    try {
      const response = await fetch(`${BASE_URL}/api/events/${event.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEvents(events.filter((e) => e.id !== event.id));
      } else {
        alert("Failed to delete event");
      }
    } catch (err) {
      alert("Error deleting event");
    }
  };

  // Edit event
  const handleEdit = (event) => {
    const originalTitle = event.title.split(" (")[0];
    setEditingEvent(event);
    setFormData({
      title: originalTitle,
      start: event.start,
      end: event.end,
      link: event.link || "",
      type: event.type || "online",
    });
    setSelectedSlot(event.start);
  };

  // Save new or updated event
  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert("Please enter a subject name");
      return;
    }

    const eventData = {
      title: formData.title.trim(),
      start: formData.start,
      end: formData.end,
      link: formData.link || null,
      type: formData.type,
    };

    try {
      if (editingEvent) {
        // Update
        const res = await fetch(`${BASE_URL}/api/events/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });

        if (res.ok) {
          const updated = await res.json();
          setEvents(events.map((e) =>
            e.id === editingEvent.id
              ? {
                  ...e,
                  ...updated,
                  start: new Date(updated.start),
                  end: new Date(updated.end),
                  title: `${updated.title} (${moment(updated.start).format("HH:mm")} - ${moment(updated.end).format("HH:mm")})`,
                }
              : e
          ));
        } else {
          alert("Failed to update event");
        }
      } else {
        // Create new
        const res = await fetch(`${BASE_URL}/api/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });

        if (res.ok) {
          const saved = await res.json();
          const displayEvent = {
            ...saved,
            start: new Date(saved.start),
            end: new Date(saved.end),
            title: `${saved.title} (${moment(saved.start).format("HH:mm")} - ${moment(saved.end).format("HH:mm")})`,
          };
          setEvents([...events, displayEvent]);
        } else {
          alert("Failed to save event");
        }
      }
    } catch (err) {
      alert("An error occurred while saving");
    }

    // Reset form
    setSelectedSlot(null);
    setEditingEvent(null);
    setFormData({ title: "", start: "", end: "", link: "", type: "online" });
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>My Calendar</h2>
        <button className="logout-btn" onClick={onLogout}>
          Log Out
        </button>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "75vh" }}
        selectable
        views={["month"]}
        defaultView="month"
        date={currentDate}
        onNavigate={(newDate) => setCurrentDate(newDate)}
        onSelectSlot={({ start }) => {
          setEditingEvent(null);
          setSelectedSlot(start);
          setFormData((prev) => ({
            ...prev,
            start,
            end: moment(start).add(1, "hour").toDate(),
          }));
        }}
        components={{
          event: (props) => (
            <EventComponent
              {...props}
              onContextMenu={(x, y, event) => setContextMenu({ x, y, event })}
            />
          ),
        }}
      />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          event={contextMenu.event}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={() => setContextMenu(null)}
        />
      )}

      {selectedSlot && (
        <div className="event-form">
          <h3>{editingEvent ? "Edit Event" : "Add New Event"}</h3>
          <input
            type="text"
            placeholder="Subject"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <input
            type="time"
            value={moment(formData.start).format("HH:mm")}
            onChange={(e) => {
              const [h, m] = e.target.value.split(":");
              setFormData({
                ...formData,
                start: moment(formData.start).hour(h).minute(m).toDate(),
              });
            }}
          />
          <input
            type="time"
            value={moment(formData.end).format("HH:mm")}
            onChange={(e) => {
              const [h, m] = e.target.value.split(":");
              setFormData({
                ...formData,
                end: moment(formData.end).hour(h).minute(m).toDate(),
              });
            }}
          />
                    <input
            type="text"
            placeholder="Link (Zoom, Teams, etc.)"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="online">Online</option>
            <option value="inclass">In Class</option>
          </select>

          <div style={{ marginTop: "10px" }}>
            <button onClick={handleSave}>
              {editingEvent ? "Save Changes" : "Add Event"}
            </button>
            <button
              style={{ marginLeft: "10px", background: "#666" }}
              onClick={() => {
                setSelectedSlot(null);
                setEditingEvent(null);
                setFormData({ title: "", start: "", end: "", link: "", type: "online" });
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyCalendar;
