"use client"
import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import { toast } from "react-toastify"
import { Download, Printer, ExternalLink, Search, BookOpen, FileText, FileCheck } from "lucide-react"

function Resources() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  const resources = [
    {
      category: "Emergency Action Plans",
      icon: <FileCheck className="h-6 w-6" />,
      items: [
        {
          title: "Personal Safety Plan",
          description: "A customizable plan for individuals at risk",
          downloadUrl: "/resources/safety-plan.pdf",
          type: "PDF",
          downloads: 1243,
        },
        {
          title: "Emergency Contact Sheet",
          description: "Template for important contacts and emergency numbers",
          downloadUrl: "/resources/emergency-contacts.pdf",
          type: "PDF",
          downloads: 987,
        },
      ],
    },
    {
      category: "Discussion Guides",
      icon: <BookOpen className="h-6 w-6" />,
      items: [
        {
          title: "Parent-Child Safety Talk Guide",
          description: "Age-appropriate conversation starters about personal safety",
          downloadUrl: "/resources/safety-talk.pdf",
          type: "PDF",
          downloads: 756,
        },
        {
          title: "Workplace Harassment Discussion Points",
          description: "Guidelines for addressing workplace abuse",
          downloadUrl: "/resources/workplace-guide.pdf",
          type: "PDF",
          downloads: 542,
        },
      ],
    },
    {
      category: "Educational Materials",
      icon: <FileText className="h-6 w-6" />,
      items: [
        {
          title: "Trusted Adults Chart",
          description: "Visual guide for identifying safe adults",
          downloadUrl: "/resources/trusted-adults.pdf",
          type: "PDF",
          downloads: 1089,
        },
        {
          title: "Personal Boundaries Worksheet",
          description: "Interactive worksheet for understanding boundaries",
          downloadUrl: "/resources/boundaries.pdf",
          type: "PDF",
          downloads: 876,
        },
      ],
    },
  ]

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleDownload = (url, title) => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", title);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
    toast.success(`Downloading ${title}...`, {
      icon: "📥",
      style: {
        borderRadius: "10px",
        background: "#4c1d95",
        color: "#fff",
      },
    });
  };
  

  const handlePrint = (url, title) => {
    const newWindow = window.open(url, "_blank");
    if (newWindow) {
      newWindow.onload = () => {
        newWindow.print();
      };
    } else {
      toast.error("Popup blocked! Please allow popups and try again.", {
        icon: "⚠️",
        style: {
          borderRadius: "10px",
          background: "#D32F2F",
          color: "#fff",
        },
      });
    }
  };

  // Filter resources based on search term and active category
  const filteredResources = resources
    .filter((category) => activeCategory === "all" || category.category === activeCategory)
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => category.items.length > 0)

  const allCategories = ["all", ...resources.map((r) => r.category)]

  return (
    <div className="min-h-screen pattern-bg bg-[#F5F0FF]">
      <Navbar />
      <div className="container mx-auto px-4 py-12 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="animate-slideUp">
              <h1 className="text-4xl font-bold text-gradient">Resources & Guides</h1>
              <p className="text-gray-600 mt-2">Helpful materials to support your journey</p>
            </div>

            {/* Search bar */}
            <div className="relative w-full md:w-64 animate-slideUp" style={{ animationDelay: "0.1s" }}>
  <input
    type="text"
    placeholder="Search resources..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full pl-12 pr-4 py-3 rounded-full bg-white shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-[#6D28D9] transition-all duration-300"
  />
  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
</div>

          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap  gap-2 mb-8 animate-slideUp" style={{ animationDelay: "0.2s" }}>
            {allCategories.map((category, index) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border 
                  ${
                    activeCategory === category
                      ? "bg-[#6D28D9] text-white border-[#6D28D9] shadow-md transform scale-105"
                      : "bg-white/80 text-gray-600 hover:bg-gray-100 border border-gray-300"
                  }`}
                style={{ animationDelay: `${0.2 + index * 0.05}s` }}
              >
                {category === "all" ? "All Resources" : category}
              </button>
            ))}
          </div>

          {/* Resource Categories */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-card-border p-6 animate-pulse"
                >
                  <div className="h-6 w-24 bg-primary-lighter/30 rounded-full mb-4"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded-full mb-3"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded-full mb-6"></div>
                  <div className="flex gap-3">
                    <div className="h-10 w-28 bg-primary-lighter/30 rounded-xl"></div>
                    <div className="h-10 w-20 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredResources.length > 0 ? (
            filteredResources.map((category, index) => (
              <div key={index} className="mb-12 animate-slideUp" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-primary-lighter/20 rounded-full text-primary mr-3">{category.icon}</div>
                  <h2 className="text-2xl font-semibold text-primary">{category.category}</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft border border-card-border p-6 hover:shadow-card transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <h3 className="text-xl font-semibold mb-2 text-primary">{item.title}</h3>
                      <p className="text-gray-600 mb-4">{item.description}</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleDownload(item.downloadUrl, item.title)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:shadow-button transition-all duration-300"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                        <button
                          onClick={() => handlePrint(item.downloadUrl, item.title)}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <Printer className="h-4 w-4" />
                          <span>Print</span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs font-medium px-2 py-1 bg-primary-lighter/10 text-primary rounded-full">
                          {item.type}
                        </span>
                        <span className="text-xs text-gray-500">{item.downloads.toLocaleString()} downloads</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft border border-card-border animate-fadeIn">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-medium mb-2 text-primary">No resources found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or browse all resources</p>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setActiveCategory("all")
                }}
                className="btn-primary"
              >
                View all resources
              </button>
            </div>
          )}

          {/* Usage Guidelines */}
          <div
            className="bg-gradient-to-r from-primary-lighter/20 to-primary-lighter/5 border-l-4 border-primary p-6 mt-8 rounded-r-2xl shadow-soft animate-slideUp"
            style={{ animationDelay: "0.5s" }}
          >
            <h3 className="text-xl font-semibold mb-2 text-primary">Usage Guidelines</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>All resources are free for personal and educational use</li>
              <li>Please do not modify or redistribute without permission</li>
              <li>For organizational use, please contact us for permission</li>
              <li>Resources are regularly updated - check back for the latest versions</li>
            </ul>
            <div className="mt-4 flex items-center text-primary">
              <ExternalLink className="h-4 w-4 mr-2" />
              <a href="/contact" className="underline hover:text-primary-dark transition-colors">
                Contact us for custom resources
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Resources

