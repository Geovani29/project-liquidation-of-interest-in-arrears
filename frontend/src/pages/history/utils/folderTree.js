// Función para organizar carpetas en jerarquía
export const buildFolderTree = (folders) => {
  const folderMap = {}
  const tree = []

  // Crear mapa de carpetas
  folders.forEach(folder => {
    folderMap[folder.id] = { ...folder, children: [] }
  })

  // Construir árbol
  folders.forEach(folder => {
    if (folder.parent_id && folderMap[folder.parent_id]) {
      folderMap[folder.parent_id].children.push(folderMap[folder.id])
    } else {
      tree.push(folderMap[folder.id])
    }
  })

  return tree
}
