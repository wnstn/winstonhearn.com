module Jekyll

  class CustomPagination < Generator
    safe true

    # This generator should be passive with regard to its execution
    priority :lowest

    def generate(site)

      pages = site.pages

      # Set up book pagination for pages with paginate: true
      paginated_pages = pages.select {|page| page.data["paginate"]}
      paginated_pages.each do |page|
        category = page.data['title'].downcase
        paginate_category(site, page, category)
      end
    end

    def paginate_category(site, page, category)

      # This will serve as the first page for pagination, and the template
      first_page = page

      # Start with all the posts
      all_posts = site.site_payload['site']['posts']
      # Only used for paginating book lists
      all_posts = all_posts.select {|post| post.categories.include?(category)}

      pages = Jekyll::Paginate::Pager.calculate_pages(all_posts, site.config['paginate'].to_i)
      (1..pages).each do |num_page|
        pager = CustomPager.new(site, num_page, all_posts, pages, first_page)
        if num_page > 1
          newpage = Page.new(site, site.source, page.dir, page.name)
          newpage.pager = pager
          newpage.dir = CustomPager.paginate_path(site, num_page, first_page)
          site.pages << newpage
        else
          page.pager = pager
        end
      end

    end

  end

  # NOTE: Modifications to Jekyll's Pager class, may need future updating
  class CustomPager < Jekyll::Paginate::Pager

    # Static: Return the pagination path of the page
    #
    # site     - the Jekyll::Site object
    # num_page - the pagination page number
    #
    # Returns the pagination path as a string
    def self.paginate_path(site, num_page, first_page)
      return nil if num_page.nil?
      if num_page <= 1
        return ensure_leading_slash(first_page.path)
      end
      format = first_page.dir + site.config['paginate_path']
      format = format.sub(':num', num_page.to_s)
      ensure_leading_slash(format)
    end

    # Initialize a new Pager.
    #
    # site     - the Jekyll::Site object
    # page      - The Integer page number.
    # all_posts - The Array of all the site's Posts.
    # num_pages - The Integer number of pages or nil if you'd like the number
    #             of pages calculated.
    # first_page - The Page used for the first page, and as a template
    def initialize(site, page, all_posts, num_pages = nil, first_page)
      @page = page
      @per_page = site.config['paginate'].to_i
      @total_pages = num_pages || CustomPager.calculate_pages(all_posts, @per_page)

      if @page > @total_pages
        raise RuntimeError, "page number can't be greater than total pages: #{@page} > #{@total_pages}"
      end

      init = (@page - 1) * @per_page
      offset = (init + @per_page - 1) >= all_posts.size ? all_posts.size : (init + @per_page - 1)

      @total_posts = all_posts.size
      @posts = all_posts[init..offset]
      @previous_page = @page != 1 ? @page - 1 : nil
      @previous_page_path = CustomPager.paginate_path(site, @previous_page, first_page)
      @next_page = @page != @total_pages ? @page + 1 : nil
      @next_page_path = CustomPager.paginate_path(site, @next_page, first_page)
    end

  end

end
