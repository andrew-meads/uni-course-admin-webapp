import { Form, Modal, Button, Row, Col } from "react-bootstrap";
import { useGroups } from "../../js/state/use-groups";
import styles from "./GroupAdminMain.module.css";
import { useState } from "react";
import GroupsList from "../../components/group-admin-page/GroupsList";
import clsx from "clsx";
import { useStudents } from "../../js/state/use-students";
import { useDialog } from "../../components/DialogProvider";

/**
 * Main area of group admin page, allows new group creation and dragging of students to groups.
 */
export default function GroupAdminMain() {
  const showDialog = useDialog();

  // State relating to showing groups
  const { moveStudentToGroup } = useStudents();
  const { groupsWithStudents, mergeGroups, deleteGroup, createNewGroup } = useGroups();
  const [groupNameFilter, setGroupNameFilter] = useState("");

  // State relating to merging groups
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [groupsToMerge, setGroupsToMerge] = useState({ targetGroup: null, sourceGroup: null });

  // State relating to deleting groups
  const [groupToDelete, setGroupToDelete] = useState(null);

  /**
   * Handles creating a new group, if the user has entered a valid, unique group name.
   *
   * Otherwise, displays an appropriate error to the user.
   */
  function handleCreateNewGroup() {
    const name = groupNameFilter.trim();

    if (name === "")
      return showDialog({ title: "No name provided", content: "Please enter a group name!" });

    const exists =
      groupsWithStudents.findIndex((g) => g.name.toLowerCase() === name.toLowerCase()) >= 0;

    if (exists)
      return showDialog({
        title: "Group already exists",
        content: `A group named "${name}" already exists!`
      });

    const valid = !/[,]/.test(name);
    if (!valid)
      return showDialog({
        title: "Invalid group name",
        content: `"${name}" is not a valid group name.`
      });

    createNewGroup(name);
  }

  // Closes the "merge groups" dialog
  const handleMergeDialogClose = () => setShowMergeDialog(false);

  /**
   * Handles when the user accepts the "merge groups" dialog. Causes the source group
   * to be merged into the target group.
   */
  function handleAcceptMerge() {
    setShowMergeDialog(false);
    const { targetGroup, sourceGroup } = groupsToMerge;
    mergeGroups(targetGroup, sourceGroup);
  }

  // Closes the "delete group" dialog
  const handleDeleteDialogClose = () => setGroupToDelete(null);

  /**
   * Handles when the user accepts the "delete group" dialog. Causes the selected
   * group to be deleted.
   */
  function handleAcceptDelete() {
    deleteGroup(groupToDelete);
    setGroupToDelete(null);
  }

  /**
   * Handles when a student is dropped onto a group. Moves the student into the group.
   *
   * @param {import('../../js/typedefs').Group} group the group where the student was dropped
   * @param {import('../../js/typedefs').Student} student the student which was dropped
   */
  function handleStudentDropped(group, student) {
    // console.log("group", group, "student", student);
    moveStudentToGroup(student, group.id);
  }

  /**
   * Handles when a group is dropped onto another group. Opens a dialog asking to confirm whether
   * to merge the dropped group into the target group.
   *
   * @param {import('../../js/typedefs').Group} targetGroup the group where the other group was dropped
   * @param {import('../../js/typedefs').Group} sourceGroup the group which was dropped
   */
  function handleGroupDropped(targetGroup, sourceGroup) {
    // console.log("targetGroup", targetGroup, "sourceGroup", sourceGroup);
    setGroupsToMerge({ targetGroup, sourceGroup });
    setShowMergeDialog(true);
  }

  return (
    <>
      <div>
        <h2>Groups</h2>
        <p>Create or delete groups, or add / remove students.</p>

        {/* Form for searching for groups, and for creating new ones. */}
        <Form>
          <Row>
            <Col>
              <Form.Control
                type="text"
                placeholder="Group name"
                value={groupNameFilter}
                onChange={(e) => setGroupNameFilter(e.target.value)}
              />
            </Col>
            <Col xs="auto">
              <Button onClick={handleCreateNewGroup}>Create new group</Button>
            </Col>
          </Row>
        </Form>

        {/* Space for holding all group cards */}
        <div className={clsx(styles.groupsContainer)}>
          <GroupsList
            groups={groupsWithStudents}
            nameFilter={groupNameFilter}
            onStudentDropped={handleStudentDropped}
            onGroupDropped={handleGroupDropped}
            onDeleteGroup={(g) => setGroupToDelete(g)}
          />
        </div>
      </div>

      {/* Dialog for confirming whether to merge groups */}
      <MergeGroupConfirmationDialog
        show={showMergeDialog}
        groupsToMerge={groupsToMerge}
        onClose={handleMergeDialogClose}
        onAccept={handleAcceptMerge}
      />

      {/* Dialog for confirming whether to delete a group */}
      <DeleteGroupConfirmationDialog
        group={groupToDelete}
        onClose={handleDeleteDialogClose}
        onAccept={handleAcceptDelete}
      />
    </>
  );
}

/**
 * A dialog for confirming whether to merge two groups.
 */
function MergeGroupConfirmationDialog({ show, groupsToMerge, onClose, onAccept }) {
  const { targetGroup, sourceGroup } = groupsToMerge;

  return (
    <Modal show={show} onHide={onClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Really merge groups?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {targetGroup ? (
          <>
            <span>
              Are you sure you want to merge the group <strong>{sourceGroup.name}</strong> into
              <strong> {targetGroup.name}</strong>?{" "}
            </span>
            <em>
              <span className="text-secondary">
                ({sourceGroup.name} will be deleted, and all its students will be added to{" "}
                {targetGroup.name}.
              </span>
              <span className="text-danger">
                <strong> This cannot be undone!</strong>
              </span>
              <span className="text-secondary">)</span>
            </em>
          </>
        ) : undefined}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="warning" onClick={onAccept}>
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

/**
 * A dialog for confirming whether to delete a group.
 */
function DeleteGroupConfirmationDialog({ group, onClose, onAccept }) {
  return (
    <Modal show={group !== null} onHide={onClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Really delete group?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {group ? (
          <>
            <span>
              Are you sure you want to delete the group <strong>{group.name}?</strong>
            </span>
            <span className="text-danger"> This action cannot be undone!</span>
          </>
        ) : undefined}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onAccept}>
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
