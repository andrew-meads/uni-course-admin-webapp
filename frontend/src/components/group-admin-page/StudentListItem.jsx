import { ListGroup } from "react-bootstrap";
import { ItemTypes } from "../../js/drag-drop";
import { useDrag } from "react-dnd";

/**
 * Renders a single list item for a student. Can be dragged into a group.
 *
 * @param {{student: import('../../js/typedefs').Student}} props
 */
export default function StudentListItem({ student }) {
  const [{ isDragging }, dragRef] = useDrag({
    type: ItemTypes.STUDENT,
    item: student,
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() })
  });

  return (
    <ListGroup.Item as="li" ref={dragRef} variant={isDragging ? "info" : undefined}>
      <strong>{student.firstName} {student.lastName}</strong>
      <br />
      <em className="text-secondary">
        {student.groupName ? <>(Member of group {student.groupName})</> : "(Not in a group)"}
      </em>
    </ListGroup.Item>
  );
}
