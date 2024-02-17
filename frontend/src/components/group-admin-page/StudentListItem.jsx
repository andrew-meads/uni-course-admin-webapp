import { ListGroup } from "react-bootstrap";
import { useGroups } from "../../js/state/use-groups";
import { ItemTypes } from "../../js/drag-drop";
import { useDrag } from "react-dnd";

/**
 * Renders a single list item for a student. Can be dragged into a group.
 *
 * @param {{student: import('../../js/typedefs').Student}} props
 */
export default function StudentListItem({ student }) {
  const { groups } = useGroups();
  const studentGroup = groups.find((g) => g.id === student.groupId);

  const [{ isDragging }, dragRef] = useDrag({
    type: ItemTypes.STUDENT,
    item: student,
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() })
  });

  return (
    <ListGroup.Item as="li" ref={dragRef} variant={isDragging ? "info" : undefined}>
      <strong>{student.name}</strong>
      <br />
      <em className="text-secondary">
        {studentGroup ? <>(Member of group {studentGroup.name})</> : "(Not in a group)"}
      </em>
    </ListGroup.Item>
  );
}
