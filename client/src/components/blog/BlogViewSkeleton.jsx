const BlogViewSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-pulse">
      {/* Title */}
      <div className="h-12 bg-primary-lighter/20 rounded-xl w-3/4 mb-6"></div>

      {/* Author and date */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-full bg-primary-lighter/20"></div>
        <div className="space-y-2">
          <div className="h-4 bg-primary-lighter/20 rounded-xl w-32"></div>
          <div className="h-3 bg-primary-lighter/10 rounded-xl w-48 flex gap-2">
            <div className="h-3 w-24 bg-primary-lighter/30 rounded-xl"></div>
            <div className="h-3 w-16 bg-primary-lighter/30 rounded-xl"></div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-8">
        <div className="h-6 w-16 bg-primary-lighter/20 rounded-full"></div>
        <div className="h-6 w-20 bg-primary-lighter/20 rounded-full"></div>
        <div className="h-6 w-14 bg-primary-lighter/20 rounded-full"></div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-8">
        <div className="h-9 w-20 bg-primary-lighter/20 rounded-xl"></div>
        <div className="h-9 w-20 bg-primary-lighter/20 rounded-xl"></div>
        <div className="h-9 w-20 bg-primary-lighter/20 rounded-xl"></div>
      </div>

      {/* Separator */}
      <div className="h-px w-full bg-primary-lighter/30 mb-8"></div>

      {/* Content */}
      <div className="space-y-4 mb-12">
        <div className="h-4 bg-primary-lighter/10 rounded-xl w-full"></div>
        <div className="h-4 bg-primary-lighter/10 rounded-xl w-full"></div>
        <div className="h-4 bg-primary-lighter/10 rounded-xl w-5/6"></div>
        <div className="h-64 w-full bg-primary-lighter/20 rounded-xl mb-4"></div> {/* Image placeholder */}
        <div className="h-4 bg-primary-lighter/10 rounded-xl w-full"></div>
        <div className="h-4 bg-primary-lighter/10 rounded-xl w-full"></div>
        <div className="h-4 bg-primary-lighter/10 rounded-xl w-4/6"></div>
        <div className="h-4 bg-primary-lighter/10 rounded-xl w-full"></div>
        <div className="h-4 bg-primary-lighter/10 rounded-xl w-5/6"></div>
      </div>

      {/* Comments section */}
      <div className="h-px w-full bg-primary-lighter/30 mb-8"></div>
      <div className="h-6 w-40 bg-primary-lighter/20 rounded-xl mb-6"></div>

      {/* Comment form */}
      <div className="flex gap-4 mb-8">
        <div className="h-10 w-10 rounded-full bg-primary-lighter/20"></div>
        <div className="flex-1 space-y-2">
          <div className="h-24 w-full bg-primary-lighter/10 rounded-xl"></div>
          <div className="flex justify-end">
            <div className="h-9 w-24 bg-primary-lighter/20 rounded-xl"></div>
          </div>
        </div>
      </div>

      {/* Comment list */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-primary-lighter/20"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-primary-lighter/20 rounded-xl w-32"></div>
              <div className="h-3 bg-primary-lighter/10 rounded-xl w-24"></div>
              <div className="h-4 bg-primary-lighter/10 rounded-xl w-full"></div>
              <div className="h-4 bg-primary-lighter/10 rounded-xl w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BlogViewSkeleton

