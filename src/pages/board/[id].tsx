import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import Column from '../../components/Board/Column'

const BoardPage = () => {
  const router = useRouter()
  const { id } = router.query
  const [board, setBoard] = useState<any>(null)

  useEffect(() => {
    if (!id) return

    fetch(`/api/boards/${id}`)
      .then(res => res.json())
      .then(data => setBoard(data))
  }, [id])

  const onDragEnd = (result: any) => {
    // We'll implement this later
  }

  if (!board) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4">
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {board?.columns.map((column: any, index: number) => (
          <Column key={column._id} column={column} index={index} />
        ))}
      </div>
    </DragDropContext>
  </div>
  )
}

export default BoardPage