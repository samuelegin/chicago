import { useNavigate } from 'react-router-dom'
import { Icon } from './Layout'
import { currentUser } from '../data/mockData'

export default function PostCard({ post, onLike }) {
  const navigate = useNavigate()

  const handleAvatarClick = () => {
    if (post.author.id === currentUser.id) {
      navigate('/profile')
    } else {
      navigate(`/profile/${post.author.id}`)
    }
  }

  return (
    <article className="bg-surface-container border border-on-background/10 lg:neo-border lg:neo-shadow p-3 lg:p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-3 lg:mb-4">
        <div className="flex gap-2 lg:gap-4">
          {/* Clickable avatar */}
          <button
            onClick={handleAvatarClick}
            className="shrink-0 focus:outline-none group"
            title={`View ${post.author.name}'s profile`}
          >
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-9 h-9 lg:w-12 lg:h-12 border border-on-background/20 lg:neo-border object-cover group-hover:brightness-90 group-hover:ring-2 group-hover:ring-primary-container transition-all"
            />
          </button>
          <div>
            <div className="flex items-center gap-1 lg:gap-2">
              {/* Clickable name too */}
              <button
                onClick={handleAvatarClick}
                className="font-bold text-on-background text-sm lg:text-base hover:text-primary-container transition-colors"
              >
                {post.author.name}
              </button>
              <span className="text-[11px] text-on-surface-variant font-mono">{post.author.handle}</span>
            </div>
            <span className="text-[11px] text-on-surface-variant font-mono">{post.timestamp}</span>
          </div>
        </div>
        {post.trending && (
          <div className="px-2 lg:px-3 py-0.5 lg:py-1 bg-primary-container border border-on-background/20 lg:neo-border flex items-center gap-1">
            <Icon name="bolt" filled className="text-[12px] lg:text-[14px] text-on-primary-fixed" />
            <span className="text-[10px] lg:text-[11px] font-bold text-on-primary-fixed uppercase tracking-wider">Trending</span>
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-sm lg:text-body-lg font-body-lg mb-3 lg:mb-6 leading-relaxed text-on-background">{post.content}</p>

      {/* Images */}
      {post.images.length === 2 && (
        <div className="grid grid-cols-2 gap-2 mb-3 lg:mb-6">
          {post.images.map((img, i) => (
            <img key={i} src={img} alt="" className="border border-on-background/15 lg:neo-border w-full aspect-video object-cover" />
          ))}
        </div>
      )}
      {post.images.length === 1 && (
        <img src={post.images[0]} alt="" className="border border-on-background/15 lg:neo-border w-full h-[200px] lg:h-[300px] object-cover mb-3 lg:mb-6" />
      )}

      {/* Actions */}
      <div className="flex justify-between pt-3 lg:pt-4 border-t border-on-background/10">
        <div className="flex gap-5 lg:gap-8">
          <button className="flex items-center gap-1.5 group transition-all" onClick={() => onLike(post.id)}>
            <Icon name="favorite" filled={post.liked} className={`text-[18px] lg:text-[24px] text-on-surface-variant group-hover:text-error transition-colors ${post.liked ? 'text-error' : ''}`} />
            <span className="text-[11px] lg:text-[12px] text-on-surface-variant">{post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}k` : post.likes}</span>
          </button>
          <button className="flex items-center gap-1.5 group transition-all">
            <Icon name="chat_bubble" className="text-[18px] lg:text-[24px] text-on-surface-variant group-hover:text-primary-container transition-colors" />
            <span className="text-[11px] lg:text-[12px] text-on-surface-variant">{post.comments}</span>
          </button>
          <button className="flex items-center gap-1.5 group transition-all">
            <Icon name="share" className="text-[18px] lg:text-[24px] text-on-surface-variant group-hover:text-primary transition-colors" />
            <span className="text-[11px] lg:text-[12px] text-on-surface-variant">{post.shares}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
