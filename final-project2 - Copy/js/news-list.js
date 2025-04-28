document.addEventListener("DOMContentLoaded", () => {
  // Get the news list container
  const newsListContainer = document.querySelector('.slide[data-row="0"][data-col="1"] ul')

  if (!newsListContainer) return

  // Create dialog element for YouTube videos
  const dialog = document.createElement("dialog")
  dialog.className = "youtube-dialog"
  dialog.innerHTML = `
    <div class="dialog-content">
      <button class="close-dialog">&times;</button>
      <iframe frameborder="0" allowfullscreen></iframe>
    </div>
  `
  document.body.appendChild(dialog)

  // Create a single video preview element that will follow the mouse
  const videoPreview = document.createElement("div")
  videoPreview.className = "video-preview"
  videoPreview.innerHTML = `<img src="/placeholder.svg" alt="">`
  document.body.appendChild(videoPreview)

  // Create a single article preview element that will follow the mouse
  const articlePreview = document.createElement("div")
  articlePreview.className = "article-preview"
  articlePreview.innerHTML = `
    <div class="article-preview-title"></div>
    <div class="article-preview-excerpt"></div>
  `
  document.body.appendChild(articlePreview)

  // Get all news items
  const newsItems = newsListContainer.querySelectorAll("li")

  // Process each news item
  newsItems.forEach((item) => {
    const title = item.querySelector("h3").textContent
    const link = item.getAttribute("data-link")
    const isArticle = item.classList.contains("news")

    // Mouse enter event to show preview
    item.addEventListener("mouseenter", () => {
      if (isArticle) {
        // For articles, show the excerpt
        const excerpt = item.querySelector(".excerpt")?.textContent || "No excerpt available"

        // Update article preview content
        //articlePreview.querySelector(".article-preview-title").textContent = title
        articlePreview.querySelector(".article-preview-excerpt").textContent = excerpt

        // Show the article preview
        articlePreview.style.opacity = "1"
        videoPreview.style.opacity = "0" // Hide video preview
      } else {
        // For YouTube videos, show the thumbnail
        const imgSrc = item.querySelector("img")?.src || ""

        // Update video preview content
        videoPreview.querySelector("img").src = imgSrc
       // videoPreview.querySelector("img").alt = title
       // videoPreview.querySelector(".video-preview-title").textContent = title

        // Show the video preview
        videoPreview.style.opacity = "1"
        articlePreview.style.opacity = "0" // Hide article preview
      }
    })

    // Mouse move event to position the preview
    item.addEventListener("mousemove", (e) => {
      const preview = isArticle ? articlePreview : videoPreview

      // Get preview dimensions
      const previewWidth = preview.offsetWidth
      const previewHeight = preview.offsetHeight

      // Calculate position (offset from cursor)
      const offsetX = 20 // Distance from cursor

      // Check if preview would go off-screen to the right
      let left = e.clientX + offsetX
      if (left + previewWidth > window.innerWidth) {
        left = e.clientX - previewWidth - offsetX
      }

      // Position the preview
      preview.style.left = `${left}px`
      preview.style.top = `${e.clientY - previewHeight / 2}px`
    })

    // Mouse leave event to hide preview
    item.addEventListener("mouseleave", () => {
      videoPreview.style.opacity = "0"
      articlePreview.style.opacity = "0"
    })

    // Add click event to open content
    item.addEventListener("click", () => {
      if (isArticle) {
        // For articles, open the link in a new tab
        window.open(link, "_blank")
      } else {
        // For YouTube videos, open in the dialog
        const iframe = dialog.querySelector("iframe")
        // Convert YouTube URL to embed URL
        const embedUrl = link.replace("watch?v=", "embed/")
        iframe.src = embedUrl
        dialog.showModal()
      }
    })
  })

  // Close dialog when close button is clicked
  const closeButton = dialog.querySelector(".close-dialog")
  closeButton.addEventListener("click", (e) => {
    e.preventDefault()
    dialog.close()
    // Clear iframe src when closing to stop video playback
    dialog.querySelector("iframe").src = ""
  })

  // Close dialog when clicking outside
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      dialog.close()
      dialog.querySelector("iframe").src = ""
    }
  })
})
