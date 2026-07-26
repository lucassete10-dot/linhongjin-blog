export interface AlbumPhoto {
  src: string
  name: string
  category: string
}

/* 相册照片自动索引：把图片放进 src/assets/album/ 即出现在首页相册，
   文件名排序即展示顺序（建议 01-xxx.jpg）；放进子文件夹则子文件夹名
   自动成为左侧的分类（如 src/assets/album/海与晴空/01.jpg）。 */
const files = import.meta.glob('../assets/album/**/*.{jpg,jpeg,png,webp,gif,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

export const photos: AlbumPhoto[] = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b, 'zh-Hans-CN'))
  .map(([path, src]) => {
    const rel = path.split('/assets/album/')[1] ?? path
    const parts = rel.split('/')
    const file = parts[parts.length - 1]
    return {
      src,
      name: file.replace(/\.[^.]+$/, '').replace(/^\d+[-_.\s]*/, ''),
      category: parts.length > 1 ? parts[0] : '',
    }
  })

export const albumCategories: string[] = [...new Set(photos.map((p) => p.category).filter(Boolean))]
