import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Link, useParams } from "react-router-dom";

const stages = ["applied", "screening", "technical", "offer", "hired", "rejected"];

const stageColors = {
  applied: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300",
  screening: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300",
  technical: "bg-purple-100 dark:bg-purple-900 text-purple-300",
  offer: "bg-green-100 dark:bg-green-900 text-green-300",
  hired: "bg-emerald-100 dark:bg-emerald-900 text-emerald-300",
  rejected: "bg-red-50 dark:bg-red-900 text-red-400 border border-dashed border-red-500 dark:border-red-600",
};

const KanbanBoard = () => {
  const { jobid } = useParams();
  const [candidates, setCandidates] = useState(
    stages.reduce((acc, stage) => ({ ...acc, [stage]: [] }), {})
  );

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const res = await fetch(`/api/candidates/${jobid}`);
        const data = await res.json();

        const grouped = stages.reduce((acc, stage) => ({ ...acc, [stage]: [] }), {});
        data.candidates.forEach((c) => {
          grouped[c.stage] ? grouped[c.stage].push(c) : grouped.applied.push(c);
        });

        setCandidates(grouped);
      } catch (err) {
        console.error("❌ Failed to fetch candidates:", err);
      }
    }

    fetchCandidates();
  }, [jobid]);

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceList = Array.from(candidates[source.droppableId]);
    const [moved] = sourceList.splice(source.index, 1);
    const destList = Array.from(candidates[destination.droppableId]);
    destList.splice(destination.index, 0, moved);

    if (source.droppableId === destination.droppableId) return;

    const updatedCandidates = {
      ...candidates,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destList,
    };
    setCandidates(updatedCandidates);

    const payload = { stage: destination.droppableId, stageUpdatedAt: new Date().toISOString() };
    try {
      await fetch(`/api/candidates/${moved.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log(`✅ Updated ${moved.name} → ${destination.droppableId}`);
    } catch (err) {
      console.error("❌ Failed to update candidate stage:", err);
      setCandidates(candidates); // rollback
    }
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold p-4">Kanban Board</h1>
        <div className="px-4 text-gray-600 dark:text-gray-400 mb-2">
          Drag and drop candidates between stages to update their status.
        </div>
        <div className="px-4 text-gray-600 dark:text-gray-400 mb-2">You can click on the candidate's name to view their details.</div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 p-4 min-h-screen">
          {stages.map((stage) => (
            <Droppable key={stage} droppableId={stage}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 flex flex-col max-h-[80vh] overflow-y-auto"
                >
                  <h2 className="font-bold capitalize mb-2 sticky top-0 bg-gray-100 dark:bg-gray-800 z-10 p-2 shadow-sm rounded-t-lg text-gray-900 dark:text-gray-100">
                    {stage}
                  </h2>
                  {candidates[stage]?.map((candidate, index) => (
                    <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-2 p-3 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer
                            ${stageColors[stage]}
                            ${snapshot.isDragging ? "scale-105 shadow-lg" : "hover:scale-105 hover:shadow-md"}
                          `}
                        >
                          <Link to={`/candidates/${candidate.id}`} className="block">
                            {candidate.name}
                          </Link>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
