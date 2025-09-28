import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Link, useParams } from "react-router-dom";

const stages = [
  "applied",
  "screening",
  "technical",
  "offer",
  "hired",
  "rejected",
];

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

        // Organize into stages
        const grouped = stages.reduce(
          (acc, stage) => ({ ...acc, [stage]: [] }),
          {}
        );
        data.candidates.forEach((c) => {
          if (grouped[c.stage]) {
            grouped[c.stage].push(c);
          } else {
            grouped.applied.push(c); // fallback if stage missing
          }
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
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceList = Array.from(candidates[source.droppableId]);
    const [moved] = sourceList.splice(source.index, 1);

    const destList = Array.from(candidates[destination.droppableId]);
    destList.splice(destination.index, 0, moved);

    if(source.droppableId === destination.droppableId) {
      return; // no stage change, no API call
    }
    
    // Optimistic update
    const updatedCandidates = {
      ...candidates,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destList,
    };
    setCandidates(updatedCandidates);

    // Prepare payload
    const payload = {
      stage: destination.droppableId,
      stageUpdatedAt: new Date().toISOString(),
    };

    try {
      await fetch(`/api/candidates/${moved.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log(`✅ Updated ${moved.name} → ${destination.droppableId}`);
    } catch (err) {
      console.error("❌ Failed to update candidate stage:", err);
      // Optionally rollback
      setCandidates(candidates);
    }
  };


  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col gap-4 p-4 h-[100%]">
        <div className="flex gap-4 flex-1 flex-grow">
          {stages.map((stage) => (
            <Droppable key={stage} droppableId={stage}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-muted flex-1 rounded-lg p-2">
                  <h2 className="font-bold capitalize mb-2 sticky top-0 bg-muted z-10 p-2 shadow-sm rounded-t-lg">
                    {stage}
                  </h2>
                  {candidates[stage]?.map((candidate, index) => (
                    <Draggable
                      key={candidate.id}
                      draggableId={candidate.id}
                      index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-2 shadow-sm">
                          <Link to={`/candidates/${candidate.id}`} className="hover:underline">
                            <div className="p-3 rounded-3xl">
                              {candidate.name}
                            </div>
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
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
